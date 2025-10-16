// /src/firebase/index.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";

// --- Firebase configuration (public keys) ---
const firebaseConfig = {
  apiKey: "AIzaSyD6O8JYEVaskylw0Tax5CWhdAUQ_n0mu3Y",
  authDomain: "easyfilev20-27833257-6347a.firebaseapp.com",
  projectId: "easyfilev20-27833257-6347a",
  storageBucket: "easyfilev20-27833257-6347a.firebasestorage.app",
  messagingSenderId: "837078045227",
  appId: "1:837078045227:web:e21ded86cacd56c129106e",
  measurementId: "G-YHEK5DM436",
};

// --- Prevent double initialization during hot reloads ---
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// --- Firestore (with local caching + multi-tab sync) ---
const db =
  getApps().length === 0
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      })
    : getFirestore(app);

// --- Auth (with browser persistence) ---
const auth = getAuth(app);
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence);
}

// --- Storage for file uploads ---
const storage = getStorage(app);

// --- Analytics only in client environment ---
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { app, db, auth, storage, analytics };
