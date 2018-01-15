// GETTERS
var getters = {
    getEnts: function (ent, callback) {
        if(ent === 'Nte') {            
            var parsedData = localStorage['Ntes'] ? JSON.parse(localStorage['Ntes']) : [];
            callback(parsedData);
        }
        else {
            $.ajax({
                url: ent === 'Req' ? constants.sdpReqsApiUrl + '?format=json&OPERATION_NAME=' + constants.sdpReqsOpName + '&TECHNICIAN_KEY=' + localStorage['techKey'] + '&data=' + JSON.stringify(constants.sdpReqInputData)
                                : ent === 'Tsk' ? constants.sdpTsksApiUrl + '?format=json&TECHNICIAN_KEY=' + localStorage['techKey'] + '&INPUT_DATA=' + JSON.stringify(constants.sdpTskInputData)
                                : constants.jraTcksApiUrl + constants.jraTckInputData + constants.jraTckLoadField,
                type: 'GET',
                dataType: 'json',
                beforeSend: function(xhr) {
                    if(ent === 'Tck')
                        xhr.setRequestHeader('Authorization', 'Basic ' + localStorage['jraBase']);
                },
                success: function (data) {        
                    debugger;
                    var parsedData = data;
                    if(!localStorage['owner_id'] && parsedData.tasks) {
                        if(parsedData.tasks[0])
                            localStorage['owner_id'] = parsedData.tasks[0].owner.id;
                    }
                    callback(ent === 'Req' ? parsedData.operation.details : ent === 'Tsk' ? parsedData.tasks : parsedData.issues);
                }
            });   
        }                         
    },

    getEnt: function (ent, id, callback) {
        if(ent === 'Nte') {
            var parsedData = localStorage['Ntes'] ? JSON.parse(localStorage['localNotes']) : [];
            if(parsedData.length){
                var note = handlers.findEntityById(ent, parsedData, id)[0];
                callback(note);
            }
        }
        else {
            $.ajax({
                url: ent === 'Req' ? constants.sdpReqsApiUrl + '/' + id + '?format=json&OPERATION_NAME=' + constants.sdpReqOpName + '&TECHNICIAN_KEY=' + localStorage['techKey']
                                : ent === 'Tsk' ? constants.sdpTskApiUrl/*s - ИСКЛЮЧИТЕЛЬНО ДЛЯ РАБОТЫ НА API V2*/ + '/' + id + '?format=json&TECHNICIAN_KEY=' + localStorage['techKey']
                                : constants.jraTckApiUrl + id,
                type: 'GET',
                dataType: 'json',
                beforeSend: function(xhr) {
                    if(ent === 'Tck')
                        xhr.setRequestHeader('Authorization', 'Basic ' + localStorage['jraBase']);
                },
                success: function (data) {
                    debugger;
                    var parsedData = data;
                    callback(ent === 'Req' ? parsedData.operation.details : ent === 'Tsk' ? /*parsedData.task*/ parsedData.tasks[0] /*ИСКЛЮЧИТЕЛЬНО ДЛЯ ПЕРЕХОДА НА API V3*/ : parsedData);
                } 
            });
        }
    },

    getSite: function(account, callback) {
        var jsonStr = JSON.stringify({ operation:{ details: { account: account } } });
        $.ajax({
            url: constants.sdpAdminUrl + '/site?format=json&TECHNICIAN_KEY=' + localStorage['techKey'] + '&data=' + jsonStr,
            type: 'GET',
            success: function(response) {
                var resultJson = response.operation;
                if(resultJson.result.status == 'Success') {
                    var sites = {
                        operation: {
                            result: { status: 'Success' },
                            details: resultJson.details[0].sites
                        }
                    };

                    callback(handlers.formSelectData(JSON.stringify(sites), 'sitename').replace('<select>', '').replace('</select>', ''));
                }
            }
        });
    },

    getTechGroup: function(account, site, callback) {
        var jsonStr = JSON.stringify({ operation: { details: { accountname: account, sitename: site } } });
        $.ajax({
            url: constants.sdpAdminUrl + '/techgroup?format=json&TECHNICIAN_KEY=' + localStorage['techKey'] + '&data=' + jsonStr,
            type: 'GET',
            success: function(response) {
                callback(handlers.formSelectData(JSON.stringify(response), 'groupname').replace('<select>', '').replace('</select>', ''));
            }
        });
    },

    getTechnician: function(account, site, group, callback) {
        var jsonStr = JSON.stringify({ operation: { details: { accountname: account, sitename: site, groupname: group } } });
        $.ajax({
            url: constants.sdpAdminUrl + '/technician?format=json&TECHNICIAN_KEY=' + localStorage['techKey'] + '&data=' + jsonStr,
            type: 'GET',
            success: function(response) {
                callback(handlers.formSelectData(JSON.stringify(response), 'name').replace('<select>', '').replace('</select>', ''));                
            }
        });
    },

    getRequester: function(account, site, callback) {
        var jsonStr = JSON.stringify({ operation: { details: { accountname: account, sitename: site } } });
        $.ajax({
            url: constants.sdpAdminUrl + '/requester?format=json&TECHNICIAN_KEY=' + localStorage['techKey'] + '&data=' + jsonStr,
            type: 'GET',
            success: function(response) {
                callback(handlers.formSelectData(JSON.stringify(response), 'name').replace('<select>', '').replace('</select>', ''));
            }
        });
    },

    getByUrl: function(url, callback){
        $.ajax({
            url: url,
            type: 'GET',
            success: function(response) {
                callback(response);
            }
        });
    }
};

// INITIATORS
var initiators = {
    initEntGrid: function (ent) { //сущность
        debugger;
        navGrids[ent].props.beforeRefresh = function(){ //nav reset
            $('#jqGrid' + ent).clearGridData();
            getters.getEnts(ent, function(parsedData){
                $(parsedData).each(function (idx, el) {                        
                    handlers.addEntity(ent, idx, el);
                });

                $('#jqGrid' + ent).trigger('reloadGrid');
                initiators.initCurEnt(ent, function(){
                    initiators.initFavEnt(ent);
                });
            });
        };

        $('#jqGrid' + ent).jqGrid(grids[ent])
            .navGrid('#jqGrid' + ent + 'Pager',
                navGrids[ent].props,                    
                navGrids[ent].editOpts,
                navGrids[ent].addOpts,
                navGrids[ent].delOpts,
                { //searchOptions
                    top:25, left:141, closeAfterSearch: true, closeAfterReset: true,
                    searchOnEnter: true,
                    onSearch: function () {
                        var postData = $('#jqGrid' + ent).jqGrid('getGridParam', 'postData');
                        $('#jqGrid' + ent).clearGridData();
                        getters.getEnt(ent, postData.searchString, function(parsedData){
                            if(parsedData !== undefined)
                                handlers.addEntity(ent, 0, parsedData);
                            
                                debugger;
                            $('#jqGrid' + ent).trigger('reloadGrid');
                            initiators.initCurEnt(ent, function(){
                                initiators.initFavEnt(ent);
                            });                            
                        });                        
                    },
                    onReset: function(){
                        $('#jqGrid' + ent).clearGridData();
                        getters.getEnts(ent, function (parsedData) {
                            $(parsedData).each(function (idx, el) {                        
                                handlers.addEntity(ent, idx, el);
                            });

                            $('#jqGrid' + ent).trigger('reloadGrid');
                            initiators.initCurEnt(ent, function(){
                                initiators.initFavEnt(ent);
                            });
                        });
                    }
                })
            .contextMenu({
                selector: '.jqgrow',
                build: function($t, e){
                    debugger;
                    var $tr = $(e.target).closest('tr.jqgrow'),
                        rowId = $tr.attr('id'),
                        item = $('#jqGrid' + ent).jqGrid('getRowData', rowId),
                        lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null,
                        favEnts = localStorage['fav' + ent] ? JSON.parse(localStorage['fav' + ent]) : [];
                        isFav = (favEnts).indexOf(item.eid) > -1;

                    $('#jqGrid' + ent).jqGrid('setSelection', rowId);                    
                
                    if(lsCurEnt && lsCurEnt.eid === item.eid){
                        return {
                            items: $.extend({}, {
                                pause: { name: 'Приостановить', icon: 'pause' },
                                stop: { name: 'Завершить', icon: 'stop' },
                                save: { name: 'С комментарием', icon: 'save'},
                                sep: '-',
                                fav: { name: (isFav ? 'Убрать из избранного' : 'Добавить в избранное'), icon: (isFav ? 'star-empty' : 'star') }
                            }, cntxtMenu[ent].items || {}),
                            callback: function(key, options){
                                debugger;
                                switch(key){
                                    case 'pause':
                                    case 'stop':
                                        handlers.saveEntityWorklog(rowId, item.eid, ent, key);
                                        break;
                                    case 'save':
                                        $('#modal').modal();
                                        initiators.initCommentTemplates();
                                        $('#saveWorklog').unbind('click').on('click', function(){
                                            handlers.saveEntityWorklog(rowId, item.eid, ent, 'save');
                    
                                            if($('#chSaveTmplt').prop('checked'))
                                                handlers.saveWorklogTemplate($('#worklogTmplt').val(), $('#worklogComment').val());
                                        });                
                                        break;
                                    case 'fav':
                                        var curEnt = handlers.findEntityById('', JSON.parse(localStorage[ent + 's']), item.eid)[0];
                                        isFav ? favEnts.splice(favEnts.indexOf(item.eid), 1) : favEnts.push(item.eid);
                                        localStorage['fav' + ent] = JSON.stringify(favEnts);
                                        handlers.updateEntity(ent, item.eid, (new Date()).getTime() - (new Date(curEnt.Active)).getTime() + (ent === 'Nte' ? curEnt.Time : 0), !isFav);
                                        break;                                        
                                }
                            }                            
                        }
                    }else{
                        return {
                            items: $.extend({}, {
                                play: { name: 'В работу', icon: 'play'},
                                sep: '-',
                                fav: { name: isFav ? 'Убрать из избранного' : 'Добавить в избранное', icon: isFav ? 'star-empty' : 'star' }
                            }, cntxtMenu[ent].items || {}),
                            callback: function(key, options){
                                debugger;
                                switch(key){
                                    case 'play':
                                        handlers.setEntityInProgress(rowId, item.eid, ent);
                                        break;
                                    case 'fav':
                                        isFav ? favEnts.splice(favEnts.indexOf(item.eid), 1) : favEnts.push(item.eid);
                                        localStorage['fav' + ent] = JSON.stringify(favEnts);
                                        handlers.updateEntity(ent, item.eid, undefined, !isFav);                                            
                                        break;                                        
                                }
                            }                            
                        }
                    }
                }
            });
        
        $.each(navGrids[ent].custBtn, function(idx, el) {
            el.type === 'separator'
                ? $('#jqGrid' + ent).navSeparatorAdd('#jqGrid' + ent + 'Pager')
                : $('#jqGrid' + ent).navButtonAdd('#jqGrid' + ent + 'Pager', el);

            if(el.type === 'select' && $.isFunction(el.onBtnAdded))
                el.onBtnAdded($('#' + el.id).find('select'));
        });
           
        getters.getEnts(ent, function (parsedData) {
            $(parsedData).each(function (idx, el) {                
                handlers.addEntity(ent, idx, el);
            });

            $('#jqGrid' + ent).trigger('reloadGrid');
            initiators.initCurEnt(ent, function(){
                initiators.initFavEnt(ent);
            });
        });
    },

    initCurEnt: function (ent, callback) {
        debugger;
        var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
        if (lsCurEnt && lsCurEnt.ent === ent) {
            var grid = '#jqGrid' + ent;
            var ids = $(grid).jqGrid('getGridParam', 'records');

            if(ids != 0){
                var entOb = handlers.findEntityById(ent, $(grid).jqGrid('getGridParam', 'data'), lsCurEnt.eid);            
                if(entOb.length){
                    var ents = JSON.parse(localStorage[ent + 's']);
                    var curEnt = handlers.findEntityById('', ents, lsCurEnt.eid)[0];
                    handlers.updateEntity(ent, curEnt.ID, (new Date()).getTime() - (new Date(curEnt.Active)).getTime() + (ent === 'Nte' ? curEnt.Time : 0));
                    if(callback)
                        return callback();
                    return;                        
                }                
            }

            getters.getEnt(ent, lsCurEnt.eid, function (parsedData) {
                var ents = JSON.parse(localStorage[ent + 's']);
                var entOb = handlers.findEntityById('', ents, lsCurEnt.eid)[0];
                handlers.addCurrentEntity(ent, parsedData, entOb.Active);
                if(callback)
                    callback();
            });
        }
        else if(callback){
            callback();
        }
    },

    initFavEnt: function (ent) {
        debugger;
        var lsFavEnt = localStorage['fav' + ent] ? JSON.parse(localStorage['fav' + ent]) : [];
        var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
        var data = $('#jqGrid' + ent).jqGrid('getGridParam', 'data');
        
        $.each(lsFavEnt, function(idx, el){
            debugger;
            var entOb = handlers.findEntityById(ent, data, el);
            if(entOb.length){
                if(lsCurEnt && lsCurEnt.ent === ent && lsCurEnt.eid === el){
                    var curEnt = handlers.findEntityById('', JSON.parse(localStorage[ent + 's']), el)[0];
                    handlers.updateEntity(ent, el, (new Date()).getTime() - (new Date(curEnt.Active)).getTime() + (ent === 'Nte' ? curEnt.Time : 0), true);
                }
                else{
                    handlers.updateEntity(ent, el, undefined, true);
                }                
            }
            else {                
                getters.getEnt(ent, el, function(parsedData){
                    debugger;
                    handlers.addFavouriteEntity(ent, parsedData);
                });
            }
        });
    },

    initBtn: function (ent, action, idx, title) {
        var btn = '';
        if(ent === 'Nte' && (action === 'stop' || action === 'save'))
            return btn;
            
        btn = '<input type="image" id="' + action + '_' + ent + '_' + idx + '" class="play-btn" src="images/icon' + action + '.png" title="' + title + '" ';
        btn +=  action === 'save' ? 'data-target="#modal" data-toggle="modal"' + '>' : '>';

        return btn;
    },

    initBtnAction: function (ent) {
        $('#jqGrid'+ ent + ' input.play-btn, #jqGrid' + ent + ' span.glyphicon').on('click', function() {
            debugger;
            var btnType = this.id.split('_')[0];
            var idx = this.id.split('_')[2];
            var id = $('#jqGrid' + ent).jqGrid('getRowData', idx).eid;

            switch (btnType){
                case 'play':
                    handlers.setEntityInProgress(idx, id, ent);
                    break;
                case 'pause':                    
                case 'stop':                                    
                    handlers.saveEntityWorklog(idx, id, ent, btnType);
                    break;
                case 'save':
                    initiators.initCommentTemplates();
                    $('#saveWorklog').unbind('click').on('click', function() {
                        handlers.saveEntityWorklog(idx, id, ent, btnType);
                        
                        if($('#chSaveTmplt').prop('checked'))
                            handlers.saveWorklogTemplate($('#worklogTmplt').val(), $('#worklogComment').val());
                    });
                    break;
                case 'fav':
                    var favEnts = localStorage['fav' + ent] ? JSON.parse(localStorage['fav' + ent]) : [];                    
                    var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
                    var isFav = favEnts.indexOf(id) > -1;
                    
                    isFav ? favEnts.splice(favEnts.indexOf(id), 1) : favEnts.push(id);
                    localStorage['fav' + ent] = JSON.stringify(favEnts);
                    if(lsCurEnt && lsCurEnt.ent === ent && lsCurEnt.eid === id){
                        var curEnt = handlers.findEntityById('', JSON.parse(localStorage[ent + 's']), id)[0];
                        handlers.updateEntity(ent, id, (new Date()).getTime() - (new Date(curEnt.Active)).getTime() + (ent === 'Nte' ? curEnt.Time : 0), !isFav);
                    }
                    else{
                        handlers.updateEntity(ent, id, undefined, !isFav);
                    }                                        
                    break;                    
            }            
        });
        
        $('#jqGrid' + ent + ' input.worktime').on('click', function() {
            debugger;
            var btnType = this.id.split('_')[0];
            var idx = this.id.split('_')[2];
            var id = $('#jqGrid' + ent).jqGrid('getRowData', idx).eid;

            handlers.changeWorkTime(idx, id, ent, btnType);
        });
    },

    initEntConstants: function (ent, entLimit) {
        switch(ent){
            case 'Req':
                constants.sdpReqInputData.operation.details.limit = entLimit.limit;
                constants.sdpReqInputData.operation.details.filterby = entLimit.filter;
                break;
            case 'Tsk':
                constants.sdpTskInputData.list_info.row_count = entLimit.limit;
                constants.sdpTskInputData.tasks.filter = entLimit.filter;
                break;     
            case 'Tck':         
                if(!entLimit.flt){
                    constants.jraTckInputData = entLimit.my ? ('assignee=' + localStorage['jraUser']) : '';
                    constants.jraTckInputData += entLimit.filter !== '' ? ((constants.jraTckInputData ? '%20and%20' : '') + 'project=' + entLimit.filter) : '';
                    constants.jraTckInputData += entLimit.opnSpr ? ((constants.jraTckInputData ? '%20and%20' : '') + 'Спринт%20in%20openSprints()' ) : '';
                    constants.jraTckInputData += (constants.jraTckInputData ? '%20and%20' : '') + 'resolution=Unresolved';
                    constants.jraTckInputData += '&maxResults=' + entLimit.limit;
                    break;                               
                }

                constants.jraTckInputData = 'filter=' + entLimit.filter;
                break;
        }
    },

    initCommentTemplates: function(){
        $('#worklogTmpltVal').empty();

        $(constants.commentTemplate).each(function(idx, el){
            $('#worklogTmpltVal').append($(new Option(el.value, el.name)));
        }); 

        if(localStorage['commentTmplt']){
            $(JSON.parse(localStorage['commentTmplt'])).each(function(idx, el){
                $('#worklogTmpltVal').append($(new Option(el.value, el.name))); 
            });        
        }        
    },

    initTabBadge: function(ent){
        var jqData = $('#jqGrid' + ent).jqGrid('getGridParam', 'data');
        var badge = $('a[href="#' + ent.replace(ent[0], ent[0].toLowerCase()) + '"]').find('span');
        var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;               
        
        badge.text(jqData.length);
        if(lsCurEnt && lsCurEnt.ent === ent){
            var rowObject = handlers.findEntityById(ent, jqData, lsCurEnt.eid)[0];
            badge.append(' / '
                + lsCurEnt.eid
                + ' '
                + formatter.workTimeFormatter(rowObject ? rowObject.worktime : undefined, { gid: 'tabBadge' }, rowObject));
        }
    },

    initSheduleTable(table){
        var header = $('<thead/>', { class: 'header' });
        var body = $('<tbody/>', { class: 'body' });
    
        $('<tr/>').appendTo(header);
        $('<th/>').appendTo(header.find('tr'));
        $('<th/>').appendTo(header.find('tr'));
        for(var i = 0; i < 24; i++){
            $('<div/>', { style: 'width:' + 100 / 24 + '%' }).append(i).appendTo($(header.find('th')[1]));
        }    
        
        $.each(constants.daysOfWeek, function(idx, el){
            $('<tr/>').appendTo(body);
            $('<td/>').append(el).appendTo(body.find('tr')[idx]);
            $('<td/>').append($('<ul/>', { class: 'schedule' })).appendTo(body.find('tr')[idx]);
        });
    
        $(body.find('tr')[0]).appendTo(body);
    
        for(var i = 0; i < 48; i++){
            $('<li/>', { style: 'width:' + 100 / 48 + '%' }).appendTo(body.find('.schedule'));
        }
        
        header.appendTo(table);
        body.appendTo(table);    
    }
};