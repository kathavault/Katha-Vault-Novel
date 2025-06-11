
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
  console.log("%cFirebase: Attempting initialization on client...", "color: blue; font-weight: bold;");
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_API_KEY") || firebaseConfig.apiKey.startsWith("AIza") === false || firebaseConfig.apiKey.length < 20) {
    console.error("%cCRITICAL: Firebase API Key is missing, invalid, or a placeholder. Firebase SDK will NOT be initialized. Check src/lib/firebase.ts and your environment configuration.", "color: red; font-weight: bold;");
  } else {
    try {
      if (getApps().length === 0) {
        console.log("Firebase: No apps initialized. Initializing new app...");
        app = initializeApp(firebaseConfig);
        console.log("%cFirebase: App initialized.", "color: green;");
      } else {
        app = getApp();
        console.log("%cFirebase: Existing app retrieved.", "color: green;");
      }

      if (app) {
        try {
          authInstance = getAuth(app);
          console.log("%cFirebase: Auth initialized.", "color: green;");
        } catch (e) {
          console.error("%cFirebase: Auth initialization FAILED.", "color: red; font-weight: bold;", e);
        }
        try {
          dbInstance = getFirestore(app);
          console.log("%cFirebase: Firestore initialized.", "color: green;");
        } catch (e) {
          console.error("%cFirebase: Firestore initialization FAILED.", "color: red; font-weight: bold;", e);
        }
        try {
          storageInstance = getStorage(app);
          console.log("%cFirebase: Storage initialized.", "color: green;");
        } catch (e) {
          console.error("%cFirebase: Storage initialization FAILED.", "color: red; font-weight: bold;", e);
        }
        
        // Optional Analytics initialization
        // if (firebaseConfig.measurementId) {
        //   try {
        //     analytics = getAnalytics(app);
        //     console.log("%cFirebase: Analytics initialized.", "color: green;");
        //   } catch (e) {
        //     console.error("%cFirebase: Analytics initialization FAILED.", "color: red; font-weight: bold;", e);
        //   }
        // }

        if (authInstance && dbInstance && storageInstance) {
            console.log("%cFirebase: SDK core services (Auth, Firestore, Storage) initialized successfully.", "color: green; font-weight: bold;");
        } else {
            let missingServices = [];
            if (!authInstance) missingServices.push("Auth");
            if (!dbInstance) missingServices.push("Firestore");
            if (!storageInstance) missingServices.push("Storage");
            console.warn(`%cFirebase: One or more core Firebase services FAILED to initialize: [${missingServices.join(', ')}]. Functionality will be affected.`, "color: orange; font-weight: bold;");
        }

      } else {
        console.error("%cCRITICAL: Firebase app object is null after initialization attempt. Firebase services will be unavailable.", "color: red; font-weight: bold;");
      }
    } catch (e) {
      console.error("%cCRITICAL FIREBASE INITIALIZATION ERROR:", "color: red; font-weight: bold;", e);
      // Ensure all instances are null if any part of initialization fails
      app = null;
      authInstance = null;
      dbInstance = null;
      storageInstance = null;
      // analytics = null;
    }
  }
} else {
  // console.log("Firebase: SDK not initialized (server-side or window undefined).");
}

// Export instances directly
export { app, authInstance as auth, dbInstance as db, storageInstance as storage /*, analytics */ };

