import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// VAPID key for web push
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Debug: Check VAPID key format
if (VAPID_KEY) {
  console.log('🔑 VAPID Key length:', VAPID_KEY.length);
  console.log('🔑 VAPID Key (first 20 chars):', VAPID_KEY.substring(0, 20));
  if (VAPID_KEY.length < 80) {
    console.warn('⚠️  WARNING: VAPID key seems too short (should be ~87 chars). It may be invalid.');
  }
} else {
  console.error('❌ VAPID_KEY is not set in environment variables');
}

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async () => {
  try {
    console.log('🔔 Requesting notification permission...');

    // Check if VAPID key is set
    if (!VAPID_KEY || VAPID_KEY.includes('undefined')) {
      throw new Error('VAPID key is not configured. Check your .env file.');
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('✅ Notification permission granted');

      // Ensure we have a service worker
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');

      const token = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('🔑 FCM Token:', token);
        return token;
      } else {
        console.log('❌ No registration token available');
        return null;
      }
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('📩 Foreground notification received:', payload);
      resolve(payload);
    });
  });

export { messaging };