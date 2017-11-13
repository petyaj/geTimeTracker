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
                initiators.initCurEnt(ent);
            });
        };

        $('#jqGrid' + ent).jqGrid(grids[ent]).navGrid('#jqGrid' + ent + 'Pager', 
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

                    $('#jqGrid' + ent).trigger('reloadGrid');
                    initiators.initCurEnt(ent);
                });
            },
            onReset: function(){
                $('#jqGrid' + ent).clearGridData();
                getters.getEnts(ent, function (parsedData) {
                    $(parsedData).each(function (idx, el) {                        
                        handlers.addEntity(ent, idx, el);
                    });

                    $('#jqGrid' + ent).trigger('reloadGrid');
                    initiators.initCurEnt(ent);
                });
            }
        }
        );
        
        $.each(navGrids[ent].custBtn, function(idx, el) {
            $('#jqGrid' + ent).navButtonAdd('#jqGrid' + ent + 'Pager', el);
        });        
                
        getters.getEnts(ent, function (parsedData) {
            $(parsedData).each(function (idx, el) {                
                handlers.addEntity(ent, idx, el);
            });

            $('#jqGrid' + ent).trigger('reloadGrid');
            initiators.initCurEnt(ent);
        });
    },

    initCurEnt: function (ent) {
        debugger;
        var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
        if(lsCurEnt && lsCurEnt.ent === ent)
        {
            var grid = '#jqGrid' + ent;
            var ids = $(grid).jqGrid('getGridParam', 'records');

            if(ids != 0){
                var entOb = handlers.findEntityById(ent, $(grid).jqGrid('getGridParam', 'data'), lsCurEnt.eid);            
                if(entOb.length){
                    var ents = JSON.parse(localStorage[ent + 's']);
                    var curEnt = handlers.findEntityById('', ents, lsCurEnt.eid)[0];
                    handlers.updateEntity(ent, curEnt.ID, (new Date()).getTime() - (new Date(curEnt.Active)).getTime() + (ent === 'Nte' ? curEnt.Time : 0));                    
                    return;
                }                
            }

            getters.getEnt(ent, lsCurEnt.eid, function (parsedData) {
                var ents = JSON.parse(localStorage[ent + 's']);
                var entOb = handlers.findEntityById('', ents, lsCurEnt.eid)[0];
                handlers.addCurrentEntity(ent, parsedData, entOb.Active);                
            });            
        }
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
        $('#jqGrid'+ ent + ' input.play-btn').on('click', function() {
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
                    $('#saveWorklog').on('click', function() {
                        handlers.saveEntityWorklog(idx, id, ent, btnType);
                        
                        if($('#chSaveTmplt').prop('checked'))
                            handlers.saveWorklogTemplate($('#worklogTmplt').val(), $('#worklogComment').val());
                    });
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
                constants.jraTckInputData += entLimit.my ? ('assignee=' + localStorage['jraUser']) : '';
                constants.jraTckInputData += entLimit.filter !== '' ? ((constants.jraTckInputData ? '%20and%20' : '') + 'project=' + entLimit.filter) : '';
                constants.jraTckInputData += entLimit.opnSpr ? ((constants.jraTckInputData ? '%20and%20' : '') + 'Спринт%20in%20openSprints()' ) : '';
                constants.jraTckInputData += (constants.jraTckInputData ? '%20and%20' : '') + 'resolution=Unresolved';
                constants.jraTckInputData += '&maxResults=' + entLimit.limit;
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
    }
};