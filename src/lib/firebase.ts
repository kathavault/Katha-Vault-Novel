
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
// Uncomment and import if you need analytics
// import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyASOaXSytY4Uq4oa1C_4mzzAYZOXEWnqQ4",
  authDomain: "katha-vault-g81gj.firebaseapp.com",
  projectId: "katha-vault-g81gj",
  storageBucket: "katha-vault-g81gj.appspot.com",
  messagingSenderId: "613581820650",
  appId: "1:613581820650:web:ae76c0a3ee82bb67627d93"
  // measurementId is optional and was not provided in the new config
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
// let analytics: Analytics | null = null; // Optional

// Initialize Firebase only on the client-side
if (typeof window !== 'undefined') {
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_API_KEY") || firebaseConfig.apiKey.length < 20) {
    console.error("Firebase API Key is missing, a placeholder, or too short. Firebase SDK will not be initialized. Please check your environment configuration and src/lib/firebase.ts.");
  } else {
    try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }

      if (app) {
        authInstance = getAuth(app);
        dbInstance = getFirestore(app);
        storageInstance = getStorage(app); // Initialize Firebase Storage
        // if (firebaseConfig.measurementId) { 
        //   analytics = getAnalytics(app);
        // }
        console.log("Firebase initialized successfully on the client.");
      } else {
        console.error("Firebase app object is null after initialization attempt.");
      }
    } catch (e) {
      console.error("Critical Firebase Initialization Error:", e);
      app = null; // Ensure these are null on error
      authInstance = null;
      dbInstance = null;
      storageInstance = null;
    }
  }
} else {
  // console.log("Firebase SDK not initialized (server-side or window undefined).");
}

// Export instances directly
export { app, authInstance as auth, dbInstance as db, storageInstance as storage /*, analytics */ };
