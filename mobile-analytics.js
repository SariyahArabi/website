// تطبيق بسيط لعرض البيانات على الموبايل
function setupMobileAnalytics() {
    // يمكنك استخدام إطار عمل مثل React Native أو Cordova
    // أو ببساطة جعل الصفحة متجاوبة مع الموبايل
}

// إشعارات فورية للطلبات الجديدة
function setupRealTimeNotifications() {
    database.ref('orders').on('child_added', (snapshot) => {
        const newOrder = snapshot.val();
        
        // إشعار للمسؤول
        if (Notification.permission === 'granted') {
            new Notification('طلب جديد!', {
                body: `طلب جديد من ${newOrder.companyName} بقيمة $${newOrder.total}`,
                icon: '/icon.png'
            });
        }
    });
}