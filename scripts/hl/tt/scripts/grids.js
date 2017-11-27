//GRIDS SETTINGS
var grids = {
    Req: {
        datatype: 'local',
        loadonce: true,
        width: null,
        height: 'auto',
        shrinkToFit: false,
        cmTemplate: { sortable: false },
        grouping: true,
        groupingView: { groupField: [ 'condition' ], groupColumnShow: [ false ], groupText: [ '<b>{0}</b>' ] },
        pager: '#jqGridReqPager',
        pgbuttons: true,
        rowNum: 10,
        viewrecords: true,
        sortname: 'status',
        localReader: {
            id: 'jqId'
        },
        colModel: [
            { label: 'ID', name: 'eid', jsonmap: 'workorderid', title: false, width: 40, align: 'center', search: true, searchoptions: { sopt: [ 'eq' ] } },
            {
                label: 'Тема', name: 'subject', title: false, width: 395, formatter: formatter.reqSubjectFormatter, unformat: unformatter.titleUnformatter, search: false,
                editable: true, editrules: { required: true }, formoptions: { elmsuffix: '<span style="color:red"> *</span>', rowpos: 7 }, edittype: 'text'
            },
            { label: 'Статус', name: 'status', title: false, width: 100, sortable: true, search: false },
            { label: 'Счётчик', name: 'worktime', title: false, width: 110, align: 'center', formatter: formatter.workTimeFormatter, search: false },
            { label: ' ', name: 'actions', title: false, width: 55, align: 'center', search: false },
            { label: ' ', name: 'condition', title: false, hidden: true },
            {
                label: 'Тип', name: 'requestTypeId', hidden: true,
                editable: true, editrules: { edithidden: true }, formoptions: { rowpos: 1 }, edittype: 'select',
                editoptions: {
                    dataUrl: constants.sdpAdminUrl + '/requesttype?format=json&TECHNICIAN_KEY=' + localStorage['techKey'],
                    buildSelect: function(response) { return handlers.formSelectData(response, 'name'); }
                }
            },
            {
                label: 'Клиент', name: 'accountId', hidden: true,
                editable: true, editrules: { edithidden: true, required: true }, formoptions: { elmsuffix: '<span style="color:red"> *</span>', rowpos: 2 }, edittype: 'select',
                editoptions: {
                    dataUrl: constants.sdpAdminUrl + '/site?format=json&TECHNICIAN_KEY=' + localStorage['techKey'],
                    buildSelect: function(response) { return handlers.formSelectData(response, 'accountname'); },
                    dataEvents: [
                        { type: 'change', fn: function(e) {
                                getters.getSite(e.target.value, function(result) {
                                   $('#siteId').empty().prop('disabled', false).append($(result)); 
                                })
                            }
                        }
                    ]
                }                
            },
            {
                label: 'Площадка', name: 'siteId', hidden: true,
                editable: true, editrules: { edithidden: true, required: true }, formoptions: { elmsuffix:'<span style="color:red"> *</span>', rowpos: 3 }, edittype: 'select',
                editoptions: {
                    value: ':',
                    dataInit: function(elem) { $(elem).prop('disabled', true); },
                    dataEvents: [
                        { type: 'change', fn: function(e) {
                                getters.getTechGroup($('#accountId').val(), e.target.value, function(result) {
                                    $('#groupId').empty().prop('disabled', false).append($(result));
                                })

                                getters.getRequester($('#accountId').val(), e.target.value, function(result) {
                                    $('#requesterId').empty().prop('disabled', false).append($(result));
                                })
                            }                         
                        }
                    ]
                }
            },
            {
                label: 'Группа', name: 'groupId', hidden: true,
                editable: true, editrules: { edithidden: true }, formoptions: { rowpos: 4 }, edittype: 'select',
                editoptions: {
                    value: ':',
                    dataInit: function(elem) { $(elem).prop('disabled', true); },
                    dataEvents: [
                        { type: 'change', fn: function(e) {
                                getters.getTechnician($('#accountId').val(), $('#siteId').val(), e.target.value, function(result) {
                                    $('#technicianId').empty().prop('disabled', false).append($(result));
                                })
                            }
                        }
                    ]
                }                
            },
            {
                label: 'Специалист', name: 'technicianId', hidden: true,
                editable: true, editrules: { edithidden: true }, formoptions: { rowpos: 5 }, edittype: 'select',
                editoptions: {
                    value: ':',
                    dataInit: function(elem) { $(elem).prop('disabled', true); }
                }
            },
            {
                label: 'Автор', name: 'requesterId', hidden: true,
                editable: true, editrules: { edithidden: true, required: true }, formoptions: { elmsuffix:'<span style="color:red"> *</span>', rowpos: 6 }, edittype: 'select',
                editoptions: {
                    value: ':',
                    dataInit: function(elem) { $(elem).prop('disabled', true); }
                }                
            },
            { label: 'Описание', name: 'body', hidden: true, editable: true, editrules: { edithidden: true }, formoptions: { rowpos: 8 }, edittype: 'textarea' },
            { label: 'Взять в работу', name: 'setInProgress', hidden: true, editable: true, editrules: { edithidden: true }, formoptions: { rowpos: 9 }, edittype: 'checkbox' }
        ],
        //onSelectRow: function() { $('#jqGridReq').resetSelection(); },
        loadComplete: function(data) {  
            initiators.initBtnAction('Req');
            initiators.initTabBadge('Req');
            $('[data-toggle=tooltip]').tooltip({ container: 'body' });
        }
    },

    Tsk: {
        datatype: 'local',
        loadonce: true,
        width: null,
        height: 'auto',
        shrinkToFit: false,
        cmTemplate: { sortable: false },
        grouping: true,
        groupingView: { groupField: ['condition'], groupColumnShow: [false], groupText: ['<b>{0}</b>'] },
        pager: '#jqGridTskPager',
        pgbuttons: true,
        rowNum: 10,
        viewrecords: true,
        sortname: 'status.name',
        localReader: {
            id: 'jqId'
        },
        colModel: [
            { label: 'ID', name: 'eid', jsonmap: 'id', title: false, width: 40, align: 'center', search: true, searchoptions: { sopt: [ 'eq' ] } },
            { label: 'Название', name: 'subject', jsonmap: 'title', title: false, width: 395, formatter: formatter.tskTitleFormatter, search: false, unformat: unformatter.titleUnformatter },
            { label: 'Статус', name: 'status.name', title: false, width: 100, sortable: true, search: false },
            { label: 'Счётчик', name: 'worktime', title: false, width: 110, align: 'center', formatter: formatter.workTimeFormatter, search: false },
            { label: ' ', name: 'actions', title: false, width: 55, align: 'center', search: false },
            { label: ' ', name: 'condition', title: false, hidden: true }
        ],
        onSelectRow: function () { $('#jqGridTsk').resetSelection(); },
        loadComplete: function (data) {
            initiators.initBtnAction('Tsk');
            initiators.initTabBadge('Tsk');
            $('[data-toggle=tooltip]').tooltip({container: 'body'});
        }
    },

    Tck: {
        datatype: 'local',
        loadonce: true,
        width: null,
        height: 'auto',
        shrinkToFit: false,
        cmTemplate: { sortable: false },
        grouping: true,
        groupingView: { groupField: ['condition'], groupColumnShow: [false], groupText: ['<b>{0}</b>'] },
        pager: '#jqGridTckPager',
        pgbuttons: true,
        rowNum: 10,
        viewrecords: true,
        sortname: 'fields.priority.id',
        localReader: {
            id: 'jqId'
        },
        colModel: [
            {
                label: 'ID', name: 'eid', jsonmap: 'key', title: false, width: 75, align: 'center', search: true, searchoptions: { sopt: [ 'eq' ],
                dataInit: function(el){
                    var filter = JSON.parse(localStorage['tckLimit']).filter;
                    $(el).val(filter.length > 0 ? filter + '-' : '');
                }} 
            },
            { label: 'Название', name: 'subject', jsonmap: 'fields.summary', title: false, width: 320, formatter: formatter.tckTitleFormatter, unformat: unformatter.titleUnformatter, search: false },
            { label: 'Статус', name: 'fields.status.name', title: false, width: 110, sortable: true, search: false },
            { label: ' ', name: 'fields.priority.id', title: false, width: 30, align: 'center', sortable: true, search: false, formatter: formatter.tckPriorityFormatter },
            { label: 'Счётчик', name: 'worktime', title: false, width: 110, align: 'center', formatter: formatter.workTimeFormatter, search: false },
            { label: ' ', name: 'actions', title: false, width: 55, align: 'center', search: false },
            { label: ' ', name: 'condition', title: false, hidden: true },
            { label: ' ', name: 'fields.priority.iconUrl', hidden: true }
        ],
        onSelectRow: function () { $('#jqGridTck').resetSelection(); },
        loadComplete: function (data) {
            initiators.initBtnAction('Tck');
            initiators.initTabBadge('Tck');
            $('[data-toggle=tooltip]').tooltip({container: 'body'});
        }
    },

    Nte: {           
        editurl: 'clientArray',     
        datatype: 'local',
        loadonce: true,
        width: true,
        height: 'auto',
        shrinkToFit: false,
        cmTemplate: { sortable: false },
        grouping: true,
        groupingView: { groupField: [ 'condition' ], groupColumnShow: [ false ], groupText: [ '<b>{0}</b>' ] },
        pager: 'jqGridNtePager',
        pgbuttons: true,
        rowNum: 10,
        viewrecords: true,
        sortname: 'ID',
        localReader: {
            id: 'jqId'
        },
        ondblClickRow: function(id) {
            $('#jqGridNte').jqGrid('editRow', id, { keys: true, focusField:1, aftersavefunc: function(rowId, status, rowData) {
                    var ID = $('#jqGridNte').jqGrid('getRowData', rowData.id).eid;
                    var ents = JSON.parse(localStorage['Ntes']);                    
                    var entOb = handlers.findEntityById('', ents, ID)[0];
                    debugger;
                    entOb.subject = rowData.subject;
                    localStorage['Ntes'] = JSON.stringify(ents);
                    $('#jqGridNte').trigger('reloadGrid');
                }
            });
        },
        colModel: [
            { label: 'ID', name: 'eid', jsonmap: 'ID', /*key: true,*/ title: false, width: 40, align: 'center', search: true },
            {
                label: 'Содержание', name: 'subject', title: false, width: 495, formatter: formatter.nteTitleFormatter, search: false,
                editable: true, edittype: 'textarea', unformat: unformatter.titleUnformatter
            },
            { label: 'Счётчик', name: 'worktime', title: false, width: 110, align: 'center', formatter: formatter.workTimeFormatter, search: false },
            { label: 'Взять в работу', name: 'setInProgress', hidden: true, editable: true, editrules: { edithidden: true }, edittype: 'checkbox'/*, editoptions: { defaultValue: 'Yes' }*/ },
            { label: ' ', name: 'actions', title: false, width: 55, align: 'center', search: false },
            { label: ' ', name: 'condition', hidden: true },
            { label: ' ', name: 'Time', hidden: true }
        ],
        loadComplete: function (data) {
            debugger;
            initiators.initBtnAction('Nte');
            initiators.initTabBadge('Nte');
            $('[data-toggle=tooltip]').tooltip({container: 'body'});
        }
    }
};

var navGrids = {
    Req: {
        props: {
            add: true,
            edit: false,
            del: false,
            search: true        
        },
        editOpts: { },
        addOpts: {
            top:25,
            left:116,
            closeAfterAdd: true,
            url: constants.sdpReqsApiUrl,
            serializeEditData: function(data){
                debugger;
                var postData = {
                    format: 'json',
                    OPERATION_NAME: constants.sdpReqAddReq,                    
                    data:JSON.stringify({
                        operation:{
                            details:{
                                requestType: data.requestTypeId,
                                account: data.accountId,
                                site: data.siteId,
                                group: data.groupId,
                                requester: data.requesterId,
                                technician: data.technicianId,
                                subject: data.subject,
                                description: data.body
                            }
                        }
                    })
                };

                return postData;
            },
            afterComplete: function(response, postdata, formid){
                debugger;
                var ids = $('#jqGridReq').jqGrid('getGridParam', 'records');
                var data = response.responseJSON.operation.details;
                
                if(postdata.setInProgress == 'on')
                {
                    handlers.addCurrentEntity('Req', data, (new Date()).getTime());               
                    handlers.setEntityInProgress(ids + 1, data.workorderid, 'Req');
                }
                else{
                    handlers.addEntity('Req', ids, data);
                    $('#jqGridReq').trigger('reloadGrid');                    
                }
            }
        },
        delOpts: { },
        custBtn: [
            {
                caption: ' ',
                buttonicon: 'ui-icon-extlink',
                position: 'last',
                onClickButton: function(){
                    debugger;                    

                    var selRowId = $('#jqGridReq').jqGrid('getGridParam', 'selrow');  
                    var selId = $('#jqGridReq').jqGrid('getRowData', selRowId).eid;
                    if(selId === undefined) {
                        $.jgrid.info_dialog.call(this, "Warning", "Please, select row", "", { left: 261, top: 105, width: 200, align: 'left' });
                        return;
                    }
                    
                    var sdpJson;
                    getters.getEnt('Req', selId, function(data) {
                        debugger;
                        sdpJson = data;
                    });

                    var MENUID = /*'2102';*/'1';
                    var jiraJsonObject = {};
                    var sdpToJiraFieldsMappingJson = {};      
                    var isMandatoryFieldEmpty = false;                                

                    $('#jraModal').modal();
                    getProjects();

                    function getProjects() {
                        var data = { MENUID: MENUID, OPERATION: 'GetProjects' };
                        var items = JSON.stringify(data);
                        $.ajax({ type: 'POST', url: baseUrl.sdp + 'servlet/ActionExecutorServlet', data: { data: items },
                            success: function (response) { 
                                debugger;                                      
                                var resultJson = JSON.parse(response.replace(/\\/g, ''));
                                if(resultJson.failure) {
                                    alertInfo('warning', 'Error: ' + resultJson.failure + '!!!');
                                }
                                else {
                                    addProjectOptions(resultJson.result);
                                }
                            }
                        });
                    };                    

                    function addProjectOptions(projects) {
                        var projectLength = projects.length;
                        var htmlOptions = [];
                        for(var i = 0; i < projectLength; i++) {
                            htmlOptions.push($(new Option(projects[i].name, projects[i].id)));
                        }

                        $('#projectId').append(htmlOptions);
                        $('#projectId').change(function() {
                            var selectedProjectId = $(this).val();
                            $('#columnfields-2,#columnfields-1,#columnfields-3').empty();
                            $('#issueId').find('option').not('[value=-1]').remove();
                            if(selectedProjectId === '-1') {
                                $('#issueId').parents('.col-xs-6').eq(0).addClass('hidden');
                            }
                            else {
                                getProjectMetaData(selectedProjectId);
                            }
                        });
                    };

                    function getProjectMetaData(projectId) {
                        var data = { MENUID: MENUID, OPERATION: 'GetFields', PROJECTID: projectId };
                        var items = JSON.stringify(data);
                        $.ajax({ type: 'POST', url: baseUrl.sdp + 'servlet/ActionExecutorServlet', data: { data: items },
                            success: function(response) {
                                var resultJson = JSON.parse(response.replace(/\\/g, ''));
                                if(resultJson.failure) {
                                    alertInfo('warning', 'Error: ' + resultJson.failure + '!!!');
                                }
                                else {
                                    jiraJsonObject = resultJson.fields.projects[0];
                                    sdpToJiraFieldsMappingJson = resultJson.mappingFields;
                                    $('#issueId').parents('.col-xs-6').eq(0).removeClass('hidden');
                                    addIssueTypeOptions(jiraJsonObject.issuetypes);
                                }
                            }
                        });
                    };

                    function addIssueTypeOptions(issueTypes) {
                        var issueTypeLength = issueTypes.length;
                        var htmlOptions = '';
                        for(var i = 0; i < issueTypeLength; i++) {
                            htmlOptions += ($(new Option(issueTypes[i].name, issueTypes[i].id)).attr('customId', i)[0]).outerHTML;
                        }

                        $('#issueId').append(htmlOptions);
                        $('#issueId').change(function() {
                            var selectedIssueId = $(this).find(':selected').attr('customId');
                            var jiraFieldLabelToIdMap = addFieldsBaseOnProjectAndIssueType(selectedIssueId);
                            setValuesOfSdpToJiraMappedFields(jiraFieldLabelToIdMap);
                        });
                    };

                    function addFieldsBaseOnProjectAndIssueType(selectedIssueId) {
                        debugger;
                        var Fields = jiraJsonObject.issuetypes[selectedIssueId].fields;
                        $('#columnfields-2,#columnfields-1,#columnfields-3').empty();
                        var jiraCustomSchema = 'com.atlassian.jira.plugin.system.customfieldtypes:';
                        var row_div, custom_row_div, fieldDiv;
                        var jiraFieldLabelToIdMap = {};
                        var count = 0; customCount = 0;
                        var input_div = $('#inputDiv').clone();
                        var select_div = $('#selectDiv').clone();
                        var textArea_div = $('#textAreaDiv').clone();
                        var info_par = $('#infoP').clone();            
                        var rowdiv = $('#row_div').clone();

                        $.each(Fields, function(idx, el) {
                            jiraFieldLabelToIdMap[Fields[idx].name] = idx;
                            var schema = Fields[idx].schema;
                            var allowedValues = Fields[idx].allowedValues;
                            var autoCompleteUrl = Fields[idx].autoCompleteUrl;
                                                                                                                //вложения
                            if(!(schema.type === 'project' || schema.type === 'issuetype' || schema.system === 'attachment' || schema.system === 'worklog' || schema.system === 'parent' || schema.system === 'issuelinks')) {
                                //Custom Cascade type fields
                                if(schema.custom && schema.custom == jiraCustomSchema + 'cascadingselect') {
                                    var casRowDiv = rowdiv.clone();
                                    var selectElement = select_div.clone();
                                    selectElement.find('select option').not('[value=-1]').remove();
                                    selectElement.find('select').attr({ 'id': idx }).removeAttr('multiselect');
                                    selectElement.find('label').text(Fields[idx].name);
                                    var optionsLength = allowedValues.length;
                                    var htmlOptions = [];
                                    for(var i = 0; i < optionsLength; i++) {
                                        var opt = $(new Option(allowedValues[i].name ? allowedValues[i].name : allowedValues[i].value, allowedValues[i].id));
                                        opt.attr('customId', i);
                                        htmlOptions.push(opt);
                                    }

                                    selectElement.find('select').append(htmlOptions);
                                    if(Fields[idx].required === true) {
                                        selectElement.find('select').attr('mandatory', 'false');
                                        mandatory_Icon_Div.appendTo(selectElement.find('.adLdiv'));
                                    }

                                    casRowDiv.append(selectElement.html());
                                    casRowDiv.removeAttr('id');
                                    selectElement = select_div.clone();
                                    selectElement.find('select option').not('[value=-1]').remove();
                                    selectElement.find('label').remove();
                                    casRowDiv.append(selectElement.find('.col-xs-6'));
                                    $('#columnfields-1').append(casRowDiv);
                                    
                                    $('#' + idx).change(function(e) {
                                        var childSelectElementId = idx + $(this).find(':selected').val();
                                        selectElement = select_div;
                                        selectElement.find('select option').not('[value=-1]').remove();
                                        selectElement.find('select').attr({ 'id': childSelectElementId, 'style': 'width: 90%' }).removeAttr('multiple');
                                        selectElement.find('label').remove();
                                        var selectedOptionId = $(this).find(':selected').attr('customId');
                                        var selectOptionId = parseInt(selectedOptionId);
                                        if(allowedValues[selectOptionId]) {
                                            var options = allowedValues[selectOptionId].children;
                                            var optionsLength = options.length;
                                            var htmlOptions = [];
                                            for(var i = 0; i < optionsLength; i++) {
                                                htmlOptions.push($(new Option(options[i].name ? options[i].name : options[i].value, options[i].id)));
                                            }
                                            selectElement.find('select').append(htmlOptions);
                                        }

                                        $('#' + idx).parent().parent().nextAll().remove();
                                        $('#' + idx).parent().parent().parent().append(selectElement.html()); 
                                    });
                                } //Standard type fields
                                else {
                                    if(count % 2 === 0) {
                                        row_div = rowdiv.clone();
                                        row_div.removeAttr('id').appendTo($('#columnfields-2'));
                                    }                                    

                                    if(allowedValues || schema.type === 'user') {
                                        fieldDiv = select_div;
                                        fieldDiv.find('label').text(Fields[idx].name).end()
                                                .find('select option').not('[value=-1]').remove();                    

                                        if(schema.type === 'array') {
                                            fieldDiv.find('select').attr({ multiple: 'multiple', id: idx });
                                        }
                                        else {
                                            fieldDiv.find('select').attr({ id: idx }).removeAttr('multiple');
                                        }
                                        
                                        var htmlOptions = [];
                                        if(allowedValues) {
                                            var optionsLength = allowedValues.length;
                                            for(var i = 0; i < optionsLength; i++) {
                                                htmlOptions.push($(new Option(allowedValues[i].name ? allowedValues[i].name : allowedValues[i].value, allowedValues[i].id)));
                                            }
                                        }    
                                        else {
                                            switch(schema.type) {
                                                case 'user':
                                                    var data = { MENUID: MENUID, OPERATION: 'GetJiraUser' };
                                                    var items = JSON.stringify(data);
                                                    $.ajax({ type: 'POST', url: baseUrl.sdp + 'servlet/ActionExecutorServlet', data: { data: items }, async: false,
                                                        success: function(response) {
                                                            debugger;
                                                            var resultJson = JSON.parse(response.replace(/\\/g, ''));
                                                            for(var i = 0; i < resultJson.users.length; i++) {
                                                                htmlOptions.push($(new Option(resultJson.users[i].displayName, resultJson.users[i].key)));
                                                            }

                                                            htmlOptions.sort(function(a, b) {
                                                                if(a[0].text > b[0].text) return 1;
                                                                if(a[0].text < b[0].text) return -1;
                                                                return 0;
                                                            });
                                                        }
                                                    });                                
                                                    break;
                                            }
                                        }                

                                        fieldDiv.find('select').append(htmlOptions);
                                        if(Fields[idx].required) {
                                            fieldDiv.find('select').attr('mandatory', 'true').prop('required', true)
                                                    .parents('.form-group').eq(0).addClass('has-error');
                                        }
                                        else {
                                            fieldDiv.find('select').attr('mandatory', 'false').prop('required', false)
                                                    .parents('.form-group').eq(0).removeClass('has-error');
                                        }
                                    }
                                    else if(schema.system === 'description') {
                                        fieldDiv = textArea_div;
                                        fieldDiv.find('label').text(Fields[idx].name).end()                                                
                                                .find('textarea').attr('id', idx);
                                        if(Fields[idx].required) {
                                            fieldDiv.find('textarea').attr('mandatory', 'true').prop('required', true)
                                                    .parents('.form-group').eq(0).addClass('has-error');
                                        }
                                        else {
                                            fieldDiv.find('textarea').attr('mandatory', 'false').prop('required', false)
                                                    .parents('.form-group').eq(0).removeClass('has-error');
                                        }
                                    }
                                    else {
                                        fieldDiv = input_div;
                                        fieldDiv.find('label').text(Fields[idx].name).end()
                                                .find('input').attr('id', idx);
                                        if(Fields[idx].required) {                                            
                                            fieldDiv.find('input').attr('mandatory', 'true').prop('required', true)
                                                    .parents('.form-group').eq(0).addClass('has-error');
                                        }                        
                                        else {
                                            fieldDiv.find('input').attr('mandatory', 'false').prop('required', false)
                                                    .parents('.form-group').eq(0).removeClass('has-error');
                                        }
                                    }

                                    fieldDiv.find('.help-block').remove();
                                    if(schema.type === 'date') {                                                            
                                        info_par.removeAttr('id').text('Например, 2014-12-30').appendTo(fieldDiv.find('.form-group'));
                                    }
                                    else if(schema.type === 'timetracking') {
                                        info_par.removeAttr('id').text('Например, 5w 6d 4h,3w 2d 23h').appendTo(fieldDiv.find('.form-group'));
                                    }
                                    else if(schema.type === 'array' && !allowedValues) {
                                        info_par.removeAttr('id').text('Например, tag1, tag2, tag3...').appendTo(fieldDiv.find('.form-group'));
                                    }
                                    else if(schema.custom && schema.custom === jiraCustomSchema + 'url') {
                                        info_par.removeAttr('id').text('Например, http://example.com').appendTo(fieldDiv.find('.form-group'));
                                    }
                                    
                                    row_div.append(fieldDiv.html());
                                    count += schema.system !== 'description' ? 1 : 0;

                                    //Дополнительные надстройки
                                    if(schema.type === 'date')
                                    {
                                        $('#' + idx).datepicker({ // Добавление datepicker для полей даты
                                            dateFormat: 'yy-mm-dd',
                                            firstDay: 1
                                        });
                                    }                        
                                }
                            }            
                        });

                        return jiraFieldLabelToIdMap;
                    };

                    function setValuesOfSdpToJiraMappedFields(jiraFieldLabelToIdMap) {
                        for(var i = 0, len = sdpToJiraFieldsMappingJson.length; i < len; i++) {
                            var jiraFieldLabel = sdpToJiraFieldsMappingJson[i].name;
                            var jiraFieldId = jiraFieldLabelToIdMap[jiraFieldLabel];
                            var sdpField = sdpToJiraFieldsMappingJson[i].value;
                            var type = sdpToJiraFieldsMappingJson[i].type;
                            if(type === 'TEXT' || type === 'TEXTAREA') {
                                $('#' + jiraFieldId).val(sdpJson[sdpField.toLowerCase()].replace(/\\/g, '')).change();
                            }
                            else if(type === 'DATE') {
                                var sdpDateValue = parseInt(sdpJson[sdpField.toLowerCase()]);
                                if(sdpDateValue !== -1) {
                                    var sdpDate = new Date(sdpDateValue);
                                    var jiraDate = '';
                                    jiraDate += sdpDate.getFullYear();
                                    jiraDate += '-' + sdpDate.getMonth();
                                    jiraDate += '-' + sdpDate.getDate();
                                    $('#' + jiraFieldId).val(jiraDate).change();
                                }
                            }
                            else if(type === 'NUMERIC') {
                                var sdpValue = parseInt(sdpJson[sdpField.toLowerCase()]);
                                $('#' + jiraFieldId).val(sdpValue).change();
                            }
                            else if(type === 'USER') {
                                var sdpValue = sdpJson[sdpField.toLowerCase()];
                                $('#' + jiraFieldId).val(sdpValue).change();
                            }
                            else if(type === 'URL') {
                                debugger;
                                if(sdpField === 'WORKORDERID') {
                                    var sdpValue = baseUrl.sdp + 'WorkOrder.do?woMode=viewWO&woID=' + sdpJson[sdpField.toLowerCase()];
                                    $('#' + jiraFieldId).val(sdpValue).change();
                                }            
                            }
                        }
                    };

                    function getFieldsValue(selectedIssueId) {
                        var fieldValues = {};
                        var ids = '-1', value = '', noValueExist;
                        var allFields = jiraJsonObject.issuetypes[selectedIssueId].fields;
                        var jiraCustomSchema = 'com.atlassian.jira.plugin.system.customfieldtypes:';

                        $.each(allFields, function(fieldId, el) {
                            if(isMandatoryFieldEmpty) {
                                return;
                            }

                            ids = '0', value = '', noValueExist = false;
                            var valuesArray = [], fieldArray = [];
                            var field = allFields[fieldId], schemaType = field.schema.type, allowedValues = field.allowedValues, customField = field.schema.custom;
                            var fieldObject = $('#' + fieldId);
                            if(fieldObject.length) {
                                fieldObject.parent().find('#errors' + fieldId).remove();
                                var isMandatoryField = (fieldObject.attr('mandatory') === 'true');
                                if(customField && customField === jiraCustomSchema + 'cascadingselect') {
                                    ids = fieldObject.val();
                                    if(ids !== '-1') {
                                        var arr = { id: ids };
                                        var childid = $('#' + fieldId + ids).val();
                                        if(childid !== '-1') {
                                            arr.child = { id: childid };
                                        }

                                        fieldValues[fieldId] = arr;
                                    }
                                    else {
                                        noValueExist = true;
                                    }
                                }
                                else if(allowedValues && schemaType === 'array') {
                                    valuesArray = fieldObject.val();
                                    if(valuesArray) {
                                        var valuesArrayLen = valuesArray.length;
                                        for(var i = 0; i < valuesArrayLen; i++) {
                                            if(valuesArray[i] !== '-1') {
                                                fieldArray.push({ 'id': valuesArray[i] });
                                            }
                                        }
                                    }
                                    if(fieldArray.length) {
                                        fieldValues[fieldId] = fieldArray;
                                    }
                                    else {
                                        noValueExist = true;
                                    }
                                }
                                else if(allowedValues) {
                                    ids = fieldObject.find(':selected').val();
                                    if(ids !== '-1') {
                                        fieldValues[fieldId] = { 'id': ids };
                                    }
                                    else {
                                        noValueExist = true;
                                    }
                                }
                                else if(schemaType === 'array') {
                                    value = fieldObject.val();
                                    if(value && value !== '') {
                                        valuesArray = value.split(',');
                                        fieldValues[fieldId] = valuesArray;
                                    }
                                    else {
                                        noValueExist = true;
                                    }
                                }            
                                else {
                                    value = fieldObject.val();
                                    if(value && value !== '-1') {
                                        if(schemaType === 'number') {
                                            fieldValues[fieldId] = parseInt(value);
                                        }
                                        else if(schemaType === 'timetracking') {
                                            valuesArray = value.split(',');
                                            fieldValues[fieldId] = { originalEstimate: valuesArray[0], remainingEstimate: valuesArray[1] };
                                        }
                                        else if(schemaType === 'user') {
                                            fieldValues[fieldId] = { name: value };
                                        }
                                        else {
                                            fieldValues[fieldId] = value;
                                        }
                                    }
                                    else {
                                        noValueExist = true;
                                    }
                                }

                                if(isMandatoryField && noValueExist) {
                                    listError(fieldId);
                                    isMandatoryFieldEmpty = true;
                                }
                            }
                        });

                        return fieldValues;
                    };

                    function listError(fieldId) {
                        debugger;
                        var fieldObject = $('#' + fieldId);
                        var modalObject = $('#jraModal');                                                          // сдвиг для label
                        var scrollTo = fieldObject.offset().top - modalObject.offset().top + modalObject.scrollTop() - 18;

                        fieldObject.parents('.form-group').eq(0).addClass('has-error');
                        $('#jraModal').scrollTop(scrollTo);
                    };

                    function alertInfo(alrtType, text, html) {
                        var alrt = '.alert-' + alrtType;

                        if(html == true)
                            $(alrt).find('strong').html(text);
                        else                            
                            $(alrt).find('strong').text(text);
                        
                        $(alrt).fadeTo(4000, 500).slideUp(500, function(){
                            $(alrt).alert();
                        });
                    };

                    function createJiraTicket() {
                        debugger;
                        var issueTypeId = $('#issueId').find(':selected').attr('customId');
                        var fieldValues = getFieldsValue(issueTypeId);
                        if(isMandatoryFieldEmpty) {
                            isMandatoryFieldEmpty = false;                            
                            return;
                        }

                        fieldValues.project = { id: $('#projectId').val() };
                        fieldValues.issuetype = { id: $('#issueId').val() };
                        var returnJson = { fields: fieldValues };
                        var Jdata = JSON.stringify(returnJson);
                        var data = { MENUID: MENUID, OPERATION: 'SaveTicket', TicketData: Jdata };
                        var items = JSON.stringify(data);
                        $.ajax({ type: 'POST', url: baseUrl.sdp + 'servlet/ActionExecutorServlet', data: { data: items }, async: false,
                            success: function(response) {
                                var resultJson = JSON.parse(response.replace(/\\/g, ''));
                                if(resultJson.result === 'failure') {
                                    var msg = resultJson.message.split(' AND ');
                                    var resp_msg = 'Errors:<br>';
                                    $.each(msg, function(i, message) {
                                        resp_msg += message + '<br>';
                                    });

                                    alertInfo('warning', resp_msg);
                                }
                                else {
                                    updateRequest(resultJson.operation, function(resultMsg) {                    
                                        $('[id^=errors]').remove();
                                        alertInfo('success', resultJson.message + '<br>' + resultMsg, true);
                                        $('#jraModal').modal('hide');
                                    });                
                                }
                            }
                        });
                    };

                    function updateRequest(operation, callback) {
                        var resultMsg = '';
                        $.each(operation, function(idx, el) {
                            var details = el.INPUT_DATA[0], url = baseUrl.sdp + 'sdpapi/request/' + sdpJson['workorderid'], type;        
                            switch(el.OPERATIONNAME)
                            {
                                case 'ADD_NOTE':
                                    var input_data = { operation: { details: { notes: { note: { notestext: details.notes.notestext } } } } };
                                    var data = { format: 'json', OPERATION: 'ADD_NOTE', data: JSON.stringify(input_data) };
                                    url += '/notes', type = 'POST';                
                                    break;
                                case 'EDIT_REQUEST':
                                    details.ACCOUNT = sdpJson['account'];
                                    details.SITE = sdpJson['site'];
                                    var input_data = { operation: { details: details } };
                                    var data = { format: 'json', OPERATION: 'EDIT_REQUEST', data: JSON.stringify(input_data) };  
                                    type = 'PUT';                              
                                    break;                
                            }

                            $.ajax({ type: type, url: url, data: data, async: false,
                                success: function(response) {
                                    debugger;
                                    var resultJson = response.operation.result;
                                    var msg = resultJson.message.replace(/\\/g, '');
                                    resultMsg += (resultJson.status === 'Failed' ? 'Error: ' : '') + msg + '<br>';
                                }
                            });        
                        });

                        callback(resultMsg);
                    };

                    $('#jraModal').on('hidden.bs.modal', function() {
                        $('#columnfields-2,#columnfields-1,#columnfields-3').empty();
                        $('#projectId').find('option').not('[value=-1]').remove();
                        $('#projectId').unbind('change');                    
                        $('#issueId').find('option').not('[value=-1]').remove();
                        $('#issueId').parents('.col-xs-6').eq(0).addClass('hidden');
                        $('#issueId').unbind('change');
                        $('#saveTck').unbind('click');
                    });

                    debugger;
                    $('#saveTck').on('click', function() {
                        createJiraTicket();
                    });
                },
                title: 'Create Jira Ticket'            
            }
        ]
    },
    Tsk: {
        props: {
            add: false,
            edit: false,
            del: false,
            search: true
        },
        editOpts: { },
        addOpts: { },
        delOpts: { },
        custBtn: [ ]
    },
    Tck : {
        props: {
            add: false,
            edit: false,
            del: false,
            search: true
        },
        editOpts: { },
        addOpts: { },
        delOpts: { },
        custBtn: [
            { type: 'separator' },
            {
                id: 'tckFavFlt',
                type: 'select',                
                caption: '<select class="ui-pg-selbox" style="background-color:transparent; width: 120px"><option value="-1">По умолчанию</option></select>',
                title: 'Избранные фильтры',
                buttonicon: 'none',
                onBtnAdded: function(elem){
                    getters.getByUrl(constants.jraFltApiUrl, function(data){
                        $(data).each(function(idx, el){
                            $(elem).append($(new Option(el.name, el.id)));
                        });

                        $(elem).on('change', function(){
                            var filter = $(this).find(':selected').val();
                            var entLimit = filter != '-1' ? { flt: true, filter: filter } : JSON.parse(localStorage['tckLimit']);
                            initiators.initEntConstants('Tck', entLimit);
                            navGrids['Tck'].props.beforeRefresh();
                        });
                    });
                }
            }
        ]
    },
    Nte: {        
        props: {
            add: true,
            edit: false,
            del: true,
            search: false
        },
        editOpts: { },
        addOpts: {
            top:25,
            left:116,
            closeAfterEdit: true,
            beforeShowForm: function(form) {
                debugger;
                $('#editmodjqGridNte').bind('keydown.formEvent', function(e) {
                    if(e.ctrlKey && e.which === 13) {
                        $('#TblGrid_jqGridNte_2 #sData').trigger('click');
                        return false;
                    }
                });
            },
            serializeEditData: function(data){
                debugger;
                var localNotes = localStorage['Ntes'] ? JSON.parse(localStorage['Ntes']) : [];
                var postData = {
                    ID: handlers.findLastId(localNotes) + 1,
                    subject: data.subject ? data.subject : '',
                    Time: 0,
                    setInProgress: data.setInProgress
                };            

                return postData;
            },
            afterComplete: function(response, postdata){
                debugger;                
                var localNotes = localStorage['Ntes'] ? JSON.parse(localStorage['Ntes']) : [];
                var setInProgress = postdata.setInProgress; delete postdata.setInProgress; delete postdata.false;
                
                localNotes.push(postdata);
                localStorage['Ntes'] = JSON.stringify(localNotes);

                if(setInProgress === 'on')
                {
                    handlers.addCurrentEntity('Nte', postdata, (new Date()).getTime());               
                    handlers.setEntityInProgress(postdata.ID, postdata.ID, 'Nte');
                }
                else{
                    handlers.addEntity('Nte', localNotes.length - 1, postdata);
                    $('#jqGridNte').trigger('reloadGrid');                    
                }                       
            }
         },
        delOpts: {        
            top:25,
            left:241,
            afterSubmit: function(response, postdata) {
                debugger;
                if(response.status == 200)
                {
                    var ID = $('#jqGridNte').jqGrid('getRowData', postdata.id).eid;                    
                    var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
                    if(lsCurEnt && lsCurEnt.ent === 'Nte' && lsCurEnt.eid == ID)                        
                        delete localStorage['curEnt'];

                    var localNotes = JSON.parse(localStorage['Ntes']);                      
                    $.each(localNotes, function(idx, el) {
                        if(el.ID == ID) {
                            localNotes.splice(idx, 1);
                            return false;
                        }
                    });

                    localStorage['Ntes'] = JSON.stringify(localNotes);
                    chrome.browserAction.setBadgeText({text: ''});
                    chrome.browserAction.setBadgeBackgroundColor({color: '#000'})
                    chrome.notifications.clear(ID.toString());
                }

                return [true, response.statusText];
            },
            afterComplete: function(response, postdata, formid) {                
                $('#jqGridNte').trigger('reloadGrid');
            }
        },
        custBtn: []
    }
};