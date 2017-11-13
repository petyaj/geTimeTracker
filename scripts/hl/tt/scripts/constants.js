//CONSTANTS
var baseUrl = {
    sdp  : 'http://hl-servicedesk.sta.local/',    
    //sdp  : 'http://192.168.4.70/',
    jira : 'http://jira.sta.local:8080/'//'http://192.168.4.61:8080/'
};

var constants = {
    sdpAdminUrl     : baseUrl.sdp + 'sdpapi/admin',
    sdpReqsApiUrl   : baseUrl.sdp + 'sdpapi/request',
    sdpReqLinkUrl   : baseUrl.sdp + 'WorkOrder.do?woMode=viewWO&woID=',
    sdpTsksApiUrl   : baseUrl.sdp + 'sdpapiv2/tasks',
    sdpTskApiUrl    : baseUrl.sdp + 'api/v3/tasks', //для загрузки конкретной задачи, т.к. sdpapiv2 не работает
    sdpTskLinkUrl   : baseUrl.sdp + 'TaskDetails.cc?TASKID=',
    sdpTskWklgUrl   : baseUrl.sdp + 'sdpapiv2/worklog',

    sdpReqsOpName   : 'GET_REQUESTS',
    sdpReqOpName    : 'GET_REQUEST',
    sdpReqAddReq    : 'ADD_REQUEST',
    sdpReqAddWklg   : 'ADD_WORKLOG',

    sdpReqInputData : { operation: { details: { from: '0', limit: '0', filterby: '' } } },
    sdpTskInputData : {
        list_info: { row_count: '0', sort_field: 'status', sort_order: 'A' },
        fields_required: [ 'id', 'title', 'created_by', 'status', 'actual_end_time', 'owner' ],
        tasks: { filter: '' } //для sdpapiv2
    },

    jraTcksApiUrl   : baseUrl.jira + 'rest/api/2/search?jql=',
    jraTckApiUrl    : baseUrl.jira + 'rest/api/2/issue/',
    jraPrjApiUrl    : baseUrl.jira + 'rest/api/2/project',
    jraTckLinkUrl   : baseUrl.jira + 'browse/',
    jraTckInputData : '',
    jraTckLoadField : '&fields=id,key,summary,status,priority',

    notification: { type: 'basic', iconUrl: 'images/icon128.png', requireInteraction: true, isClickable: true },
    commentTemplate: [
        { name:'Доработка', value:'Реализация доработки' },
        { name:'Код-ревью', value:'Выполнение ревью кода по проекту' },
        { name:'Перенос на предпрод', value:'Выполнение переноса проекта на ПредПрод' }
    ]
};