
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
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
// let analytics: Analytics | null = null; // Optional

// Initialize Firebase only on the client-side
if (typeof window !== 'undefined') {
  try {
    // Basic check for placeholder or missing API key
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_API_KEY")) {
      console.error("Firebase API Key is missing or is a placeholder. Firebase SDK will not be initialized.");
    } else if (firebaseConfig.apiKey.startsWith("AIzaSyC") && firebaseConfig.apiKey.length < 30) {
        // Example check for potentially problematic "generic" keys if they are known to cause issues without restrictions
        // This is a heuristic; actual validation is more complex.
        console.warn("Firebase API Key might be a generic key. Ensure it's properly configured and restricted for your web app in the Google Cloud Console for security and functionality. If issues persist, this could be a source.");
    }

    // Proceed with initialization only if API key seems present and not an obvious placeholder
    if (firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("YOUR_API_KEY")) {
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApp();
        }

        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        // if (firebaseConfig.measurementId) { // Initialize Analytics if measurementId exists
        //   analytics = getAnalytics(app);
        // }
    } else {
      // Log that services will be unavailable if API key was deemed missing/placeholder
       console.warn("Firebase app not initialized due to API key issue. Firebase services (auth, db, storage) will not be available.");
    }
  } catch (e) {
    console.error("Critical Firebase Initialization Error:", e);
    // Ensure app and services remain null if any part of init fails
    app = null;
    auth = null;
    db = null;
    storage = null;
    // analytics = null;
  }
}

export { app, auth, db, storage /*, analytics */ };
