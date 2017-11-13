/*
chrome.alarms.create('test', { delayInMinutes: 1, periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(function(alarm){
    var notification = { type: 'basic', iconUrl: 'images/icon128.png', requireInteraction: true, isClickable: true, title: 'event test title', message: 'event test message' };
    chrome.notifications.create('event test', notification);
});
*/