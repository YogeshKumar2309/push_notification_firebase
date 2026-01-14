// Service Worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config (same as in frontend)
const firebaseConfig = {
  apiKey: "AIzaSyD0Nql3-PVGf8k1hUMsYW4nOfxATVjanX8",
  authDomain: "push-notificaiton-softzen.firebaseapp.com",
  projectId: "push-notificaiton-softzen",
  storageBucket: "push-notificaiton-softzen.firebasestorage.app",
  messagingSenderId: "232976564886",
  appId: "1:232976564886:web:b5c0e72b78a050211638b7"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Background notification received:', payload);

  const notificationTitle = payload.notification.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new message',
    icon: payload.notification.icon || '/logo.png',
    badge: '/badge.png',
    tag: 'notification-' + Date.now(),
    requireInteraction: false,
    data: {
      url: payload.fcmOptions?.link || 'https://softzen.in'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked:', event);
  
  event.notification.close();

  // Open the URL from notification data
  const urlToOpen = event.notification.data?.url || 'https://softzen.in';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if window is already open
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if not already open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});