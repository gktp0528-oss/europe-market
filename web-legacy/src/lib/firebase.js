// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAIZ4SQe-91e83Ib-yEDGpzSdQg3xPda4Y",
    authDomain: "eurosari.firebaseapp.com",
    projectId: "eurosari",
    storageBucket: "eurosari.firebasestorage.app",
    messagingSenderId: "685085701462",
    appId: "1:685085701462:web:5d72a240217988402a12f7",
    measurementId: "G-1CLDYYV6R1"
};

const app = initializeApp(firebaseConfig);

let messagingInstancePromise = null;

const getMessagingInstance = async () => {
    if (typeof window === "undefined") {
        return null;
    }

    if (!messagingInstancePromise) {
        messagingInstancePromise = (async () => {
            try {
                const supported = await isSupported();
                if (!supported) return null;
                return getMessaging(app);
            } catch (err) {
                console.log("FCM is not supported in this browser context.", err);
                return null;
            }
        })();
    }

    return messagingInstancePromise;
};

export const requestForToken = async () => {
    try {
        const messaging = await getMessagingInstance();
        if (!messaging) return null;

        if (!("serviceWorker" in navigator)) {
            console.log("Service Worker is not available.");
            return null;
        }

        const serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

        const currentToken = await getToken(messaging, {
            serviceWorkerRegistration,
            vapidKey: "BH696G3XF7z1qY_W3tL0T6X8fI2N5tK5zI1T8X9L0_W3tL0T6X8fI2N5tK5zI1T8X9L0" // 실제 VAPID 키로 교체 필요
        });
        if (currentToken) {
            console.log('FCM Token:', currentToken);
            return currentToken;
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        getMessagingInstance().then((messaging) => {
            if (!messaging) {
                resolve(null);
                return;
            }

            onMessage(messaging, (payload) => {
                resolve(payload);
            });
        });
    });
