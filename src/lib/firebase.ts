
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
// Firebase App Check has been removed from client-side initialization.

// Uncomment and import if you need analytics
// import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyASOaXSytY4Uq4oa1C_4mzzAYZOXEWnqQ4",
  authDomain: "katha-vault-g81gj.firebaseapp.com",
  projectId: "katha-vault-g81gj",
  storageBucket: "katha-vault-g81gj.appspot.com",
  messagingSenderId: "613581820650",
  appId: "1:613581820650:web:ae76c0a3ee82bb67627d93"
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
// App Check instance HATA DIYA GAYA HAI
// let analytics: Analytics | null = null; // Optional


if (typeof window !== 'undefined') {
  console.log("%cFirebase: Attempting initialization on client...", "color: blue; font-weight: bold;");
  try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_API_KEY") || firebaseConfig.apiKey.startsWith("AIza") === false || firebaseConfig.apiKey.length < 20) {
      console.error("%cCRITICAL: Firebase API Key is missing, invalid, or a placeholder. Firebase SDK will NOT be initialized. Check src/lib/firebase.ts and your environment configuration.", "color: red; font-weight: bold; font-size: 1.3em; border: 2px solid red; padding: 5px;");
      throw new Error("Invalid Firebase API Key configuration.");
    }

    try {
      if (getApps().length === 0) {
        console.log("Firebase: No apps initialized. Attempting initializeApp...");
        app = initializeApp(firebaseConfig);
      } else {
        console.log("Firebase: Existing app found. Attempting getApp()...");
        app = getApp();
      }
    } catch (initError: any) {
      console.error("%cFirebase: Core App initialization (initializeApp/getApp) FAILED.", "color: red; font-weight: bold;", initError);
      app = null;
    }

    if (app && typeof app.name !== 'undefined' && app.options && app.options.projectId === firebaseConfig.projectId) {
      console.log(`%cFirebase: App successfully initialized or retrieved. App name: ${app.name}, Project ID: ${app.options.projectId}`, "color: green; font-weight: bold;");

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

      // App Check related code has been removed from here.
      // If you re-enable App Check, ensure your Firebase Project Settings (Console -> App Check) for services like Authentication
      // have enforcement OFF if you don't intend to provide an App Check token from the client.

      if (authInstance && dbInstance && storageInstance) {
          console.log("%cFirebase: SDK core services (Auth, Firestore, Storage) initialized successfully.", "color: green; font-weight: bold;");
      } else {
          let missingServices = [];
          if (!authInstance) missingServices.push("Auth");
          if (!dbInstance) missingServices.push("Firestore");
          if (!storageInstance) missingServices.push("Storage");
          console.warn(`%cFirebase: One or more core Firebase services FAILED to initialize: [${missingServices.join(', ')}]. App functionality related to these services will be affected.`, "color: orange; font-weight: bold;");
      }
    } else {
      console.error("%cCRITICAL: Firebase app object is null, undefined, or not a valid FirebaseApp instance after initialization attempt (name or options missing/invalid). Firebase services will be unavailable. All Firebase instances set to null.", "color: red; font-weight: bold; font-size: 1.3em; border: 2px solid red; padding: 5px;");
      app = null;
      authInstance = null;
      dbInstance = null;
      storageInstance = null;
    }
  } catch (e: any) {
    console.error("%cCRITICAL FIREBASE INITIALIZATION ERROR (Outer Catch):", "color: red; font-weight: bold; font-size: 1.3em;", e);
    app = null;
    authInstance = null;
    dbInstance = null;
    storageInstance = null;
  }
}

export { app, authInstance as auth, dbInstance as db, storageInstance as storage };
