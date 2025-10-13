import admin from "firebase-admin";
import { readFileSync } from "fs";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "easyfilev20-27833257-6347a.appspot.com"
});

export const db = admin.firestore();
export const auth = admin.auth();
export const bucket = admin.storage().bucket();

console.log("✅ Firebase Admin SDK initialized successfully.");
