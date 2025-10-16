import { getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD6O8JYEVaskylw0Tax5CWhdAUQ_n0mu3Y",
  authDomain: "easyfilev20-27833257-6347a.firebaseapp.com",
  projectId: "easyfilev20-27833257-6347a",
  storageBucket: "easyfilev20-27833257-6347a.firebasestorage.app",
  messagingSenderId: "837078045227",
  appId: "1:837078045227:web:e21ded86cacd56c129106e",
  measurementId: "G-YHEK5DM436",
};

export function initializeFirebase() {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  return { firebaseApp: app, firestore, auth };
}
