//HANDLERS
var handlers = {
    setEntityInProgress: function (idx, id, ent) {
        debugger;
        var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
        if(lsCurEnt && lsCurEnt.ent !== ent){
            alert('У Вас уже находится в работе ' + constants.entityDictionary[lsCurEnt.ent][0].toLowerCase() + ' №' + lsCurEnt.eid);
            return;
        }

        var now = new Date();        
        var ents = localStorage[ent + 's'] ? JSON.parse(localStorage[ent + 's']) : [];
        var entOb = handlers.findEntityById('', ents, id)[0];
        var subj = $('#jqGrid' + ent).jqGrid('getRowData', idx).subject;
        var favEnts = localStorage['fav' + ent] ? JSON.parse(localStorage['fav' + ent]) : [];
        var isFav = favEnts.indexOf(id) > -1;

        if(entOb){
            entOb.Active = now;
        }
        else {
            entOb = {
                ID: id,
                Active: now,
                Stop: null,
                Time: null
            };

            ents.push(entOb);
        }

        if(lsCurEnt){            
            var curEnt = handlers.findEntityById('', ents, lsCurEnt.eid)[0];
            curEnt.Stop = now;
            curEnt.Time = now.getTime() - (new Date(curEnt.Active)).getTime() + (ent === 'Nte' ? curEnt.Time : 0);
            curEnt.Comment = null;
            handlers.createEntityWorklog(ent, curEnt, function(){
                localStorage[ent + 's'] = JSON.stringify(ents);
                handlers.updateEntity(ent, curEnt.ID, ent === 'Nte' ? curEnt.Time : undefined, isFav);

                chrome.notifications.clear(curEnt.ID.toString());
            });
        }
        
        localStorage['curEnt'] = JSON.stringify({ ent: ent, eid: entOb.ID });
        localStorage[ent + 's'] = JSON.stringify(ents);
        localStorage['alarms'] = JSON.stringify([{ name: constants.alarms[0], changed: true }]);
        handlers.updateEntity(ent, entOb.ID, ent === 'Nte' ? entOb.Time : 0, isFav);

        //Настройка бэйджа и push-уведомления
        constants.notification.title = 'Сейчас в работе ' + constants.entityDictionary[ent][0].toLowerCase() + ' №' + entOb.ID;
        constants.notification.message = subj;

        chrome.notifications.create(entOb.ID.toString(), constants.notification);
        chrome.browserAction.setBadgeBackgroundColor({ color: '#000'});
        chrome.browserAction.setBadgeText({text: 'play'});        
    },
    
    saveEntityWorklog: function(idx, id, ent, action){
        var now = new Date();        
        var ents = localStorage[ent + 's'] ? JSON.parse(localStorage[ent + 's']) : [];
        var entOb = handlers.findEntityById('', ents, id)[0];

        if(!entOb)
            return;

        var favEnts = localStorage['fav' + ent] ? JSON.parse(localStorage['fav' + ent]) : [];
        var isFav = favEnts.indexOf(id) > -1;

        debugger;

        entOb.Stop = now;
        entOb.Time = now.getTime() - (new Date(entOb.Active)).getTime() + (ent === 'Nte' ? entOb.Time : 0);
        entOb.Comment = action === 'save' ? $('#worklogComment').val() : null;

        if(action === 'alarms'){
            var notice = JSON.parse(localStorage['notice']);
            entOb.Time -= parseInt(notice.period) * 60000;
        }

        handlers.createEntityWorklog(ent, entOb, function(){
            delete localStorage['curEnt'];
            delete localStorage['alarms'];
            localStorage[ent + 's'] = JSON.stringify(ents);
            if(action !== 'alarms' && action !== 'no')
                handlers.updateEntity(ent, entOb.ID, ent === 'Nte' ? entOb.Time : undefined, isFav);

            chrome.browserAction.setBadgeText({text: ''});
            chrome.browserAction.setBadgeBackgroundColor({color: '#000'})
            chrome.notifications.clear(entOb.ID.toString());   

            if(action === 'save'){
                $('#modal').modal('hide');
                $('#worklogTmplt').val('');
                $('#worklogComment').val('');
            }

            if(action !== 'alarms' && action !== 'no')
                $('#jqGrid' + ent).trigger('reloadGrid');

            if(action === 'stop' && ent !== 'Nte')
                window.open((ent === 'Req' ? constants.sdpReqLinkUrl : ent === 'Tsk' ? constants.sdpTskLinkUrl : constants.jraTckLinkUrl) + entOb.ID);
        }); 
    },

    createEntityWorklog: function(ent, req, callback){
        debugger;
        if(ent === 'Nte')
            return callback();

        var url_worklog = ent === 'Req' ? (constants.sdpReqsApiUrl + '/' + req.ID + '/worklogs') : constants.sdpTskWklgUrl;
        var start = (new Date(req.Active)).getTime();
        var stop = (new Date(req.Stop)).getTime() - 7.5*3600*1000;        
        var hours = Math.floor(req.Time / 3600000);
        var minutes = parseInt((req.Time - (hours * 3600000))/60000);
        var comment = req.Comment ? req.Comment : 'google ext';
        var input_data = ent === 'Req' ? { //Для заявок SDP
            operation: {
                details: {
                    worklogs: {
                        worklog: {                            
                            description: comment,
                            starttime: start,
                            workHours: hours,
                            workMinutes: minutes == 0 ? 1 : minutes
                        }
                    }
                }
            }
        } : ent === 'Tsk' ? { //Для задач SDP
            worklog: {                
                task: { id: req.ID },
                description: comment,
                technician: { id: localStorage['owner_id'] },
                end_time: { value: stop },
                total_time_spent: req.Time
            }
        } : { //Для тикетов Jira
            comment: comment,
            started: req.Active.replace('Z', '+0000'),
            timeSpentSeconds: parseInt(req.Time / 1000) < 60 ? 60 : parseInt(req.Time / 1000)  
        }
        
        $.ajax({
            url: ent === 'Tck' ? constants.jraTckApiUrl + req.ID + '/worklog?adjustEstimate=auto'
                               : url_worklog + (ent === 'Tsk' ? ('?INPUT_DATA=' + JSON.stringify(input_data)) : ''),
            type: 'POST',
            dataType: 'json',
            contentType: ent === 'Tck' ? 'application/json' : 'application/x-www-form-urlencoded',
            data: ent === 'Tck' ? JSON.stringify(input_data)
                                : {
                                    format: 'json',
                                    OPERATION_NAME: ent === 'Req' ? constants.sdpReqAddWklg : '',
                                    TECHNICIAN_KEY: localStorage['techKey'],
                                    data: JSON.stringify(input_data)
                                },
            success: function (data) {
                debugger;
                callback();
            }
        });
    },

    changeWorkTime: function(idx, id, ent, action){
        debugger;
        var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
        var timeStamp = 5*60000;
        var startWorkDay = (new Date()); startWorkDay.setHours(8, 0, 0);
        
        if(lsCurEnt && lsCurEnt.ent === ent && lsCurEnt.eid == id){
            var ents = localStorage[ent + 's'] ? JSON.parse(localStorage[ent + 's']) : [];
            var curEnt = handlers.findEntityById('', ents, lsCurEnt.eid)[0];
            var currentTime = new Date(curEnt.Active);

            switch(action){
                case 'up':
                    currentTime.setTime(currentTime.getTime() - timeStamp);

                    if(currentTime > startWorkDay)
                        curEnt.Active = currentTime;

                    break;
                case 'down':
                    currentTime.setTime(currentTime.getTime() + timeStamp);
                    
                    if(currentTime < (new Date()).getTime())                     
                        curEnt.Active = currentTime; 

                    break;                                
            }
            
            localStorage[ent + 's'] = JSON.stringify(ents);            
            initiators.initCurEnt(ent, function() {
                initiators.initFavEnt(ent);
            });
        }
    },    

    findEntityById: function(ent, array, id) {
        return $.grep(array, function(n, i){
            var eid;
            switch(ent){
                case 'Req':
                    eid = n.workorderid;
                    break;
                case 'Tsk':
                    eid = n.id;
                    break;
                case 'Tck':
                    eid = n.key;
                    break;                                
                case 'Acnt':
                    eid = n.accountname;
                    break;
                case 'Site':
                    eid = n.sitename;
                    break;       
                case 'Grp':
                    eid = n.groupname;
                    break;
                case 'alarms':
                    eid = n.name;
                    break;                    
                default: //для данных из localStorage
                    eid = n.ID;
            }

            return eid == id;
        });
    },    

    findLastId: function(array) {
        debugger;
        var id = 0;
        $.each(array, function(idx, el) {
            if(parseInt(el.ID) > id)
                id = el.ID
        });

        return parseInt(id);
    },

    addEntity: function(ent, idx, data){
        data.worktime = ent === 'Nte' ? data.Time : undefined;
        data.condition = constants.entityDictionary[ent][1] + '&nbsp;';
        data.actions = initiators.initBtn(ent, 'play', idx + 1, 'В работу');
        $('#jqGrid' + ent).jqGrid('addRowData', idx + 1, data);
    },

    addCurrentEntity: function(ent, data, active) {
        debugger;
        var ids = $('#jqGrid' + ent).jqGrid('getGridParam', 'records');

        data.worktime = (new Date()).getTime() - (new Date(active)).getTime();
        data.condition = constants.entityDictionary[ent][0] + ' в работе';
        data.actions = initiators.initBtn(ent, 'pause', ids + 1, 'Приостановить')
                        + initiators.initBtn(ent, 'stop', ids + 1, 'Завершить')
                        + initiators.initBtn(ent, 'save', ids + 1, 'С комментарием');

        $('#jqGrid' + ent).jqGrid('addRowData', ids + 1, data);
        $('#jqGrid' + ent).trigger('reloadGrid');
    },

    addFavouriteEntity: function(ent, data) {
        debugger;
        var ids = $('#jqGrid' + ent).jqGrid('getGridParam', 'records');

        data.condition = constants.entityDictionary[ent][1] + ' избранное';
        data.actions = initiators.initBtn(ent, 'play', ids + 1, 'В работу');
        data.favourite = true;
        $('#jqGrid' + ent).jqGrid('addRowData', ids + 1, data);
        $('#jqGrid' + ent).trigger('reloadGrid');        
    },

    updateEntity: function(ent, id, active, fav) {
        debugger;
        var jqData = $('#jqGrid' + ent).jqGrid('getGridParam', 'data');
        var entOb = handlers.findEntityById(ent, jqData, id)[0];
        var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
        var curEntId = (lsCurEnt && lsCurEnt.ent === ent) ? lsCurEnt.eid : undefined;

        entOb.worktime = active;
        entOb.condition = curEntId == id
                            ? constants.entityDictionary[ent][0] + ' в работе'
                            : constants.entityDictionary[ent][1] + (fav ? ' избранное' : '&nbsp;');
        entOb.actions = curEntId == id ? (initiators.initBtn(ent, 'pause', entOb.jqId, 'Приостановить') +
                            initiators.initBtn(ent, 'stop', entOb.jqId, 'Завершить') +
                            initiators.initBtn(ent, 'save', entOb.jqId, 'С комментарием')) : initiators.initBtn(ent, 'play', entOb.jqId, 'В работу');
        entOb.favourite = fav;
        
        $('#jqGrid' + ent).trigger('reloadGrid');
    },

    formSelectData: function(data, fieldName, fieldId, altFieldName){
        var resultJson = JSON.parse(data).operation;
        var select = '<select>';
        if(resultJson.result.status == 'Success'){
            var length = resultJson.details.length;
            select += $(new Option())[0].outerHTML;
            for(var i = 0; i < length; i++){
                select += $(new Option(resultJson.details[i][fieldName] ? resultJson.details[i][fieldName] : resultJson.details[i][altFieldName ? altFieldName : fieldName]
                                        , resultJson.details[i][fieldId ? fieldId : fieldName]))[0].outerHTML;
            }
        }

        return select + '</select>';
    },

    saveWorklogTemplate: function(tmplt, tmpltVal){
        debugger;
        var template = null;
        var commentTemplate = localStorage["commentTmplt"] ? JSON.parse(localStorage['commentTmplt']) : [];
        if(commentTemplate.length > 0){
            template = $.grep(commentTemplate, function(n, i){ return n.name.toLowerCase() == tmplt.toLowerCase(); })[0];
        }

        if(!template){
            template = { name: tmplt, value: tmpltVal };
            commentTemplate.push(template);
        }
        else{
            template.value = tmpltVal;
        }

        localStorage['commentTmplt'] = JSON.stringify(commentTemplate);
    }
};