
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
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_API_KEY") || firebaseConfig.apiKey.length < 20) {
      console.error("Firebase API Key is missing, a placeholder, or too short. Firebase SDK will not be initialized. Please check your environment configuration and src/lib/firebase.ts.");
    } else {
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApp();
        }

        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app); // Initialize Firebase Storage
        // if (firebaseConfig.measurementId) { 
        //   analytics = getAnalytics(app);
        // }
        console.log("Firebase initialized successfully on the client.");
    }
  } catch (e) {
    console.error("Critical Firebase Initialization Error:", e);
    app = null;
    auth = null;
    db = null;
    storage = null;
    // analytics = null;
  }
} else {
  // console.log("Firebase SDK not initialized (server-side or window undefined).");
}

export { app, auth, db, storage /*, analytics */ };
