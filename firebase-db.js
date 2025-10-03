// دالة لتسجيل زيارات الصفحات
function trackPageView(pageName) {
    const visitData = {
        page: pageName,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
    };
    
    database.ref('page_views').push(visitData);
}

// دالة لتسجيل الأحداث
function trackEvent(eventName, data = {}) {
    const eventData = {
        event: eventName,
        ...data,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    database.ref('events').push(eventData);
}

// في كل صفحة، أضف هذا الكود:
document.addEventListener('DOMContentLoaded', function() {
    const pageName = document.title;
    trackPageView(pageName);
});