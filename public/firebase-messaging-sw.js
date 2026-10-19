/**
 * Firebase Cloud Messaging — Background Message Handler
 * Must be served at the root of the site (same origin).
 * Uses Firebase compat SDK via importScripts (no bundler needed in SW context).
 */

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            'AIzaSyDE8fCVBWiQ0GoOM_tXoGSMa8rL5NEL2tk',
  authDomain:        'ecotechservices-d8cc4.firebaseapp.com',
  projectId:         'ecotechservices-d8cc4',
  storageBucket:     'ecotechservices-d8cc4.firebasestorage.app',
  messagingSenderId: '461649135819',
  appId:             '1:461649135819:web:db178808f2735bd142f34e',
  measurementId:     'G-HSEMKWL42L',
});

const messaging = firebase.messaging();

// Handle messages when the tab is in the background / closed
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Yaswant Code';
  const body  = payload.notification?.body  || 'New update available';
  const icon  = payload.notification?.icon  || '/favicon.svg';
  const link  = payload.data?.link          || '/';

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/favicon.svg',
    tag:   'yaswant-push',
    renotify: true,
    data: { link },
    actions: [
      { action: 'open',    title: 'View Now' },
      { action: 'dismiss', title: 'Dismiss'  },
    ],
  });
});

// Notification click — open the app and navigate to the link
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const link = event.notification.data?.link || '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) client.navigate(link);
            return;
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(link);
      })
  );
});
