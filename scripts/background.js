chrome.alarms.create('test', { delayInMinutes: 1, periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(function(alarm){
    var notification = {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        requireInteraction: true,
        isClickable: true,
        title: 'event test title',
        message: 'event test message',
        buttons: [{ title: 'PAUSE', iconUrl: 'images/iconpause.png' }, { title: 'STOP', iconUrl: 'images/iconstop.png' }] };
    chrome.notifications.create('event test', notification);
});

chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex){
    debugger;
    switch(buttonIndex)
    {
        case 0:
            localStorage[notificationId] = buttonIndex;
            break;
        case 1:                                    
            localStorage[notificationId] = buttonIndex;
            break;
    }
});