/* global firebase, importScripts */
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAIZ4SQe-91e83Ib-yEDGpzSdQg3xPda4Y",
    authDomain: "eurosari.firebaseapp.com",
    projectId: "eurosari",
    storageBucket: "eurosari.firebasestorage.app",
    messagingSenderId: "685085701462",
    appId: "1:685085701462:web:5d72a240217988402a12f7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
