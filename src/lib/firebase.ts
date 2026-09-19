import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId,
};

// Initialize Firebase safely (avoid multi-instance bugs during HMR or reloads)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const GOOGLE_CLIENT_ID = firebaseConfigData.oAuthClientId;

// Initialize Analytics safely in supported browser environments
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => { });
}

// Connection validator as mandated by the Firebase Integration Skill
async function validateFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Silently fall back to offline/local mode when database is not provisioned or offline
    const msg = error instanceof Error ? error.message : '';
    if (msg.includes('the client is offline')) {
      console.info('Firebase running in offline/cached mode.');
    }
  }
}

// Call validation in non-blocking async
if (typeof window !== 'undefined') {
  validateFirestoreConnection();
}

export default {
  app,
  db,
  auth,
  analytics,
  googleAuthProvider,
  GOOGLE_CLIENT_ID,
};
