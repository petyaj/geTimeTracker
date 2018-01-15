
//chrome.alarms.clearAll();
chrome.alarms.create('init', { delayInMinutes: 1, periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(function(alarm){
    debugger;
    var notice = localStorage['notice'] ? JSON.parse(localStorage['notice']) : null;
    switch(alarm.name){
        case 'init':
            var alarms = localStorage['alarms'] ? JSON.parse(localStorage['alarms']) : [];
            $.each(alarms, function(idx, el){
                if(el.changed){
                    chrome.alarms.create(el.name, { delayInMinutes: parseInt(notice.period), periodInMinutes: parseInt(notice.period) });
                    el.changed = false;
                }
            });                

            localStorage['alarms'] = JSON.stringify(alarms);            
            break;
        case constants.alarms[0]:
            var lsAlarm = handlers.findEntityById('alarms', JSON.parse(localStorage['alarms']), alarm.name)[0];
            var curEnt = localStorage['curEnt'] ? JSON.parse(localStorage['curEnt']) : null;
            if(notice && notice.checked && !lsAlarm.changed)
            {
                if(curEnt){
                    if(!curEnt.notified){
                        createNotice(curEnt);
                        curEnt.notified = true;
                        localStorage['curEnt'] = JSON.stringify(curEnt);
                    }
                    else{
                        handlers.saveEntityWorklog('', curEnt.eid, curEnt.ent, 'alarms');
                        chrome.notifications.clear('entity notice');
                    }
                }
            }
            else{
                chrome.alarms.clear(alarm.name);
            }
            break;            
    }    
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
    debugger;
    var curEnt = JSON.parse(localStorage['curEnt']);
    switch(buttonIndex)
    {
        case 0: //YES            
            curEnt.notified = false;
            localStorage['curEnt'] = JSON.stringify(curEnt);
            break;
        case 1: //NO            
            handlers.saveEntityWorklog('', curEnt.eid, curEnt.ent, 'no');            
            break;
    }

    chrome.notifications.clear(notificationId);
});

function createNotice(curEnt){
    var notice = constants.notification;
    notice.title = 'Сейчас в работе';
    notice.message = 'Вы действительно работаете над ' + constants.entityDictionary[curEnt.ent][2].toLowerCase() + ' №' + curEnt.eid + '?';
    notice.buttons = [ { title: 'Да' }, { title: 'Нет' }];
    chrome.notifications.create('entity notice', notice);
};