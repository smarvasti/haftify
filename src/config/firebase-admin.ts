import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Konvertiere den privaten Schlüssel in das richtige Format
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey
  }),
};

// Initialize Firebase Admin
const apps = getApps();
const app = !apps.length ? initializeApp(firebaseAdminConfig) : apps[0];

export const auth = getAuth(app); 