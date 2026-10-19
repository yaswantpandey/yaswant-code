/**
 * Push Notification Service — Firebase Cloud Messaging (FCM)
 * Handles permission requests, token management, subscribe/unsubscribe.
 */

const FCM_SW_PATH = '/firebase-messaging-sw.js';
const NOTIFY_API  = '/api/notify.php';

// VAPID key — generate from: Firebase Console → Project Settings
// → Cloud Messaging → Web Push certificates → Generate key pair
// Then paste the public key value here:
const VAPID_KEY = import.meta.env.VITE_FCM_VAPID_KEY || '';

export type NotifPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export function isNotificationSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

export function getNotificationPermission(): NotifPermission {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission as NotifPermission;
}

export function isSubscribed(): boolean {
  try {
    return localStorage.getItem('push_subscribed') === '1';
  } catch {
    return false;
  }
}

function setSubscribed(val: boolean) {
  try {
    if (val) localStorage.setItem('push_subscribed', '1');
    else      localStorage.removeItem('push_subscribed');
  } catch {}
}

async function getFcmToken(): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn('[Notifications] VITE_FCM_VAPID_KEY not set. Add it to your .env file.');
    return null;
  }
  try {
    const { getMessaging, getToken } = await import('firebase/messaging');
    const { app } = await import('../lib/firebase');
    const messaging = getMessaging(app);
    const sw = await navigator.serviceWorker.register(FCM_SW_PATH, { scope: '/' });
    const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: sw });
    return token || null;
  } catch (err) {
    console.error('[Notifications] Failed to get FCM token:', err);
    return null;
  }
}

export async function subscribeToNotifications(): Promise<{ success: boolean; message: string }> {
  if (!isNotificationSupported()) {
    return { success: false, message: 'Push notifications are not supported in this browser.' };
  }

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { success: false, message: 'Notification permission was denied.' };
  }

  const token = await getFcmToken();
  if (!token) {
    return {
      success: false,
      message: 'Could not get push token. Check that VITE_FCM_VAPID_KEY is set in .env',
    };
  }

  // Save token on our server
  try {
    const res  = await fetch(NOTIFY_API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'subscribe', token }),
    });
    const data = await res.json();
    if (data.success) {
      setSubscribed(true);
      return { success: true, message: 'Subscribed! You will now receive updates.' };
    }
    return { success: false, message: data.error || 'Server error.' };
  } catch {
    return { success: false, message: 'Network error while subscribing.' };
  }
}

export async function unsubscribeFromNotifications(): Promise<{ success: boolean; message: string }> {
  try {
    const token = await getFcmToken();
    if (token) {
      await fetch(NOTIFY_API, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'unsubscribe', token }),
      });
    }
    setSubscribed(false);
    return { success: true, message: 'Unsubscribed from notifications.' };
  } catch {
    setSubscribed(false);
    return { success: true, message: 'Unsubscribed.' };
  }
}

export async function sendPushNotification(opts: {
  title:   string;
  body:    string;
  link?:   string;
  icon?:   string;
  topic?:  string;
  authToken: string;
}): Promise<{ success: boolean; message: string; sent?: number }> {
  const res = await fetch(NOTIFY_API, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${opts.authToken}`,
    },
    body: JSON.stringify({
      action: 'send',
      title:  opts.title,
      body:   opts.body,
      link:   opts.link  || '/',
      icon:   opts.icon  || '/favicon.svg',
      topic:  opts.topic || 'all',
    }),
  });
  return res.json();
}
