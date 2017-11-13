//HANDLERS
var handlers = {
    setEntityInProgress: function (idx, id, ent) {
        debugger;
        var now = new Date();        
        var ents = localStorage[ent + 's'] ? JSON.parse(localStorage[ent + 's']) : [];
        var entOb = handlers.findEntityById('', ents, id)[0];
        var curEntId = localStorage['cur' + ent];
        var subj = $('#jqGrid' + ent).jqGrid('getRowData', idx).subject;

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

        if(curEntId){
            var curEnt = handlers.findEntityById('', ents, curEntId)[0];
            curEnt.Stop = now;
            curEnt.Time = now.getTime() - (new Date(curEnt.Active)).getTime() + (ent === 'Nte' ? curEnt.Time : 0);
            curEnt.Comment = null;
            handlers.createEntityWorklog(ent, curEnt, function(){
                localStorage['cur' + ent] = entOb.ID;
                localStorage[ent + 's'] = JSON.stringify(ents);
                handlers.updateEntity(ent, curEnt.ID, ent === 'Nte' ? curEnt.Time : undefined);

                chrome.notifications.clear(curEnt.ID.toString());
            });           
        }
        
        localStorage['cur' + ent] = entOb.ID;
        localStorage[ent + 's'] = JSON.stringify(ents);
        handlers.updateEntity(ent, entOb.ID, ent === 'Nte' ? entOb.Time : 0);

        //Настройка бэйджа и push-уведомления
        constants.notification.title = 'Сейчас в работе ' + (ent === 'Req' ? 'заявка' : ent === 'Tsk' ? 'задача' : ent === 'Tck' ? 'тикет' : 'заметка') + ' №' + entOb.ID;
        constants.notification.message = subj;
        //constants.notification.buttons = [{ title: 'PAUSE', iconUrl: 'images/iconpause.png' }, { title: 'STOP', iconUrl: 'images/iconstop.png' }];
        chrome.notifications.create(entOb.ID.toString(), constants.notification);
        chrome.browserAction.setBadgeText({text: 'play'});

        /*chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
            debugger;
            switch(buttonIndex)
            {
                case 0:
                    handlers.saveEntityWorklog(null, notificationId, 'Tsk', 'pause');
                    break;
                case 1:                                    
                    handlers.setRequestInDone(null, notificationId);
                    break;
            }
        });*/
    },
    
    saveEntityWorklog: function(idx, id, ent, action){
        var now = new Date();        
        var ents = localStorage[ent + 's'] ? JSON.parse(localStorage[ent + 's']) : [];
        var entOb = handlers.findEntityById('', ents, id)[0];

        if(!entOb)
            return;

        debugger;

        entOb.Stop = now;
        entOb.Time = now.getTime() - (new Date(entOb.Active)).getTime() + (ent === 'Nte' ? entOb.Time : 0);
        entOb.Comment = action === 'save' ? $('#worklogComment').val() : null;

        handlers.createEntityWorklog(ent, entOb, function(){
            delete localStorage['cur' + ent];
            localStorage[ent + 's'] = JSON.stringify(ents);            
            handlers.updateEntity(ent, entOb.ID, ent === 'Nte' ? entOb.Time : undefined);
            chrome.browserAction.setBadgeText({text: ''});
            chrome.browserAction.setBadgeBackgroundColor({color: '#000'})
            chrome.notifications.clear(entOb.ID.toString());   

            if(action === 'save'){
                $('#modal').modal('hide');
                $('#worklogTmplt').val('');
                $('#worklogComment').val('');
            }

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
        var curEntId = localStorage['cur' + ent];
        var timeStamp = 5*60000;
        var startWorkDay = (new Date()); startWorkDay.setHours(8, 0, 0);
        
        if(curEntId && curEntId == id) {
            var ents = localStorage[ent + 's'] ? JSON.parse(localStorage[ent + 's']) : [];
            var curEnt = handlers.findEntityById('', ents, curEntId)[0];
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
            initiators.initCurEnt(ent);
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
                default:
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
        data.condition = ent === 'Req' ? 'Запросы' : ent === 'Tsk' ? 'Задачи' : ent === 'Tck' ? 'Тикеты' : 'Заметки';
        data.actions = initiators.initBtn(ent, 'play', idx + 1, 'В работу');
        $('#jqGrid' + ent).jqGrid('addRowData', idx + 1, data);
    },

    addCurrentEntity: function(ent, data, active) {
        debugger;
        var ids = $('#jqGrid' + ent).jqGrid('getGridParam', 'records');

        data.worktime = (new Date()).getTime() - (new Date(active)).getTime();
        data.condition = (ent === 'Req' ? 'Запрос' : ent === 'Tsk' ? 'Задача' : ent === 'Tck' ? 'Тикет' : 'Заметка') + ' в работе';
        data.actions = initiators.initBtn(ent, 'pause', ids + 1, 'Приостановить')
                        + initiators.initBtn(ent, 'stop', ids + 1, 'Завершить')
                        + initiators.initBtn(ent, 'save', ids + 1, 'С комментарием');
        
        $('#jqGrid' + ent).jqGrid('addRowData', ids + 1, data);
        $('#jqGrid' + ent).trigger('reloadGrid');
    },

    updateEntity: function(ent, id, active) {
        debugger;
        var jqData = $('#jqGrid' + ent).jqGrid('getGridParam', 'data');
        var entOb = handlers.findEntityById(ent, jqData, id);

        entOb[0].worktime = active;
        entOb[0].condition = localStorage['cur' + ent] == id
                            ? ((ent === 'Req' ? 'Запрос' : ent === 'Tsk' ? 'Задача' : ent === 'Tck' ? 'Тикет' : 'Заметка') + ' в работе')
                            : (ent === 'Req' ? 'Запросы' : ent === 'Tsk' ? 'Задачи' : ent === 'Tck' ? 'Тикеты' : 'Заметки');
        entOb[0].actions = localStorage['cur' + ent] == id ? (initiators.initBtn(ent, 'pause', entOb[0].jqId, 'Приостановить') +
                            initiators.initBtn(ent, 'stop', entOb[0].jqId, 'Завершить') +
                            initiators.initBtn(ent, 'save', entOb[0].jqId, 'С комментарием')) : initiators.initBtn(ent, 'play', entOb[0].jqId, 'В работу');

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