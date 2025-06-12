
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
// Only import initializeAppCheck and AppCheck type if reCaptchaKey is placeholder
import { initializeAppCheck, type AppCheck } from 'firebase/app-check';

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
let appCheckInstance: AppCheck | null = null;

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

      // Initialize App Check - MUST be before other services
      // Simplified to only handle debug token flow as reCaptchaKey is a placeholder
      if (typeof initializeAppCheck === 'function') {
        try {
          console.warn("%cFirebase App Check: NOTICE - reCAPTCHA v3 Site Key is a PLACEHOLDER. Attempting to use DEBUG TOKEN. Ensure `(window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;` is set (done automatically here if not production) OR use a REAL reCAPTCHA key for production/enforcement.", "color: orange; font-weight: bold;");
          if (process.env.NODE_ENV !== 'production') {
            (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
            console.log("%cFirebase: FIREBASE_APPCHECK_DEBUG_TOKEN set to true for non-production environment.", "color: orange;");
          }
          appCheckInstance = initializeAppCheck(app); // Initialize with app instance only for debug token
          console.log("%cFirebase: App Check initialized (attempting DEBUG mode).", "color: orange; font-weight: bold;");
        } catch (e: any) {
          console.error("%cFirebase: App Check initialization FAILED.", "color: red; font-weight: bold;", e);
          appCheckInstance = null;
        }
      } else {
        console.error("%cFirebase: initializeAppCheck function is NOT available. App Check will not be initialized. Check Firebase SDK installation.", "color: red; font-weight: bold;");
        appCheckInstance = null;
      }

      // Initialize other services AFTER App Check attempt
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

      let serviceCheckMessage = "%cFirebase: SDK core services status: ";
      let allGood = true;
      if (authInstance) serviceCheckMessage += "Auth (OK), "; else { serviceCheckMessage += "Auth (FAIL), "; allGood = false; }
      if (dbInstance) serviceCheckMessage += "Firestore (OK), "; else { serviceCheckMessage += "Firestore (FAIL), "; allGood = false; }
      if (storageInstance) serviceCheckMessage += "Storage (OK), "; else { serviceCheckMessage += "Storage (FAIL), "; allGood = false; }
      if (appCheckInstance) serviceCheckMessage += "AppCheck (OK)."; else { serviceCheckMessage += "AppCheck (FAIL)."; /* Not critical if App Check fails */ }
      console.log(serviceCheckMessage, `color: ${allGood ? 'green' : 'orange'}; font-weight: bold;`);
      if (!allGood) {
        console.warn("%cFirebase: One or more core Firebase services (Auth, Firestore, Storage) FAILED to initialize. App functionality related to these services will be affected.", "color: orange; font-weight: bold;");
      }

    } else {
      console.error("%cCRITICAL: Firebase app object is null, undefined, or not a valid FirebaseApp instance after initialization attempt (name or options missing/invalid). Firebase services will be unavailable. All Firebase instances set to null.", "color: red; font-weight: bold; font-size: 1.3em; border: 2px solid red; padding: 5px;");
      app = null;
      authInstance = null;
      dbInstance = null;
      storageInstance = null;
      appCheckInstance = null;
    }
  } catch (e: any) {
    console.error("%cCRITICAL FIREBASE INITIALIZATION ERROR (Outer Catch):", "color: red; font-weight: bold; font-size: 1.3em;", e);
    app = null;
    authInstance = null;
    dbInstance = null;
    storageInstance = null;
    appCheckInstance = null;
  }
}

export { app, authInstance as auth, dbInstance as db, storageInstance as storage, appCheckInstance };
