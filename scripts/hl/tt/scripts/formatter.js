//FORMATTER
var formatter = {
    dateFormatter: function (cellvalue, options, rowObject) {
        var dt = new Date(cellvalue / 1);
        var day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
        var month = dt.getMonth() < 9 ? '0' + (dt.getMonth() + 1) : (dt.getMonth() + 1);
        var hour = dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours();
        var minute = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();

        return day + '/' + month + '/' + dt.getFullYear() + ' ' + hour + ':' + minute;
    },

    workTimeFormatter: function (cellvalue, options, rowObject) {        
        if(cellvalue === undefined)
            return '';        
        
        var ent = options.gid.replace('jqGrid','');
        var hours = Math.floor(cellvalue / 3600000);
        var minutes = parseInt((cellvalue - (hours * 3600000))/60000);
        var time = (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes);

        if(ent === 'Nte'){
            var lsCurEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
            if(!lsCurEnt || lsCurEnt.ent !== ent || lsCurEnt.eid != rowObject.ID)
                return time;
        }
        else if(ent === 'tabBadge')
            return time;

        return '<input type="button" id="' + 'down_' + ent + '_' + rowObject.jqId +'" class="worktime" value="-" title="-5 мин">'
                + '  ' + time + '  '
                + '<input type="button" id="' + 'up_' + ent + '_' + rowObject.jqId + '" class="worktime" value="+" title="+5 мин">';
    },

    reqSubjectFormatter: function (cellvalue, options, rowObject) {        
        return '<a href="' + constants.sdpReqLinkUrl + rowObject.workorderid + '" id="' + rowObject.workorderid
            + '" target="_blank" data-toggle="tooltip" data-html="true" data-placement="auto" title="'
            + cellvalue.replace(/[\'\\{2,}]+/g, '').replace(/\"/g, "'") + '">'
            + cellvalue.replace(/[\'\\{2,}]+/g, '')
            + '</a>';
    },

    tskTitleFormatter: function (cellvalue, options, rowObject) {
        return '<a href="' + constants.sdpTskLinkUrl + rowObject.id + '" id="' + rowObject.id
        + '" target="_blank" data-toggle="tooltip" data-html="true" data-placement="auto" title="'
        + cellvalue.replace(/\\/g, '').replace(/"/, '') + '">'
        + cellvalue.replace(/\\/g, '')
        + '</a>';
    },

    tckTitleFormatter: function (cellvalue, options, rowObject) {
        return '<a href="' + constants.jraTckLinkUrl + rowObject.key + '" id="' + rowObject.key
        + '" target="_blank" data-toggle="tooltip" data-html="true" data-placement="auto" title="'
        + cellvalue.replace(/\\/g, '').replace(/"/, '') + '">'
        + cellvalue.replace(/\\/g, '')
        + '</a>';
    },

    nteTitleFormatter: function (cellvalue, options, rowObject) {
        debugger;
        return '<a href="#" id="0' + rowObject.ID
        + '" data-toggle="tooltip" data-html="true" data-placement="auto" title="'
        + cellvalue.replace(/\\/g, '').replace(/"/, '') + '">'
        + cellvalue.replace(/\\/g, '')
        + '</a>';
    },

    tckPriorityFormatter: function(cellvalue, options, rowObject) {
        var imgSrc = rowObject['fields.priority.iconUrl'];
        return imgSrc != undefined ? '<img style="height:16px" alt="' + cellvalue + '" src="' + imgSrc + '">' : cellvalue;
    }
};

var unformatter = {
    titleUnformatter: function (cellvalue, options, cell) {
        return cellvalue;
    }
}