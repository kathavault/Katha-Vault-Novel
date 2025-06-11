
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';

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
let appCheckInstance: AppCheck | null = null;
// let analytics: Analytics | null = null; // Optional


if (typeof window !== 'undefined') {
  console.log("%cFirebase: Attempting initialization on client...", "color: blue; font-weight: bold;");
  try { // Outer try for all client-side Firebase setup
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("YOUR_API_KEY") || firebaseConfig.apiKey.startsWith("AIza") === false || firebaseConfig.apiKey.length < 20) {
      console.error("%cCRITICAL: Firebase API Key is missing, invalid, or a placeholder. Firebase SDK will NOT be initialized. Check src/lib/firebase.ts and your environment configuration.", "color: red; font-weight: bold; font-size: 1.3em;");
      throw new Error("Invalid Firebase API Key configuration."); // Throw to be caught by outer catch
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
      app = null; // Ensure app is null if core init fails
    }

    // More robust check for a valid FirebaseApp instance
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

      // --- App Check Initialization ---
      try {
        const reCaptchaKey = 'YOUR_RECAPTCHA_V3_SITE_KEY_PLACEHOLDER';
        if (!app) { // This check is now somewhat redundant due to the earlier robust check but kept for safety
          console.error("%cFirebase: 'app' is unexpectedly null/undefined before App Check initialization attempt.", "color: red; font-weight: bold;");
          throw new Error("'app' is unexpectedly null/undefined before App Check initialization attempt.");
        }

        if (reCaptchaKey === 'YOUR_RECAPTCHA_V3_SITE_KEY_PLACEHOLDER' || !reCaptchaKey) {
          (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
          console.warn("%cFirebase App Check: NOTICE - reCAPTCHA v3 Site Key is a placeholder. Attempting to use DEBUG TOKEN. For production, replace the placeholder key in src/lib/firebase.ts. Ensure FIREBASE_APPCHECK_DEBUG_TOKEN is set in your console if issues persist after refresh.", "color: orange; font-weight: bold; border: 1px solid orange; padding: 3px;");
          appCheckInstance = initializeAppCheck(app, {
            isTokenAutoRefreshEnabled: true
            // No provider, relies on debug token set on window
          });
          console.log("%cFirebase: App Check initialized (attempting DEBUG mode).", "color: green;");
        } else {
          console.log("%cFirebase App Check: Using configured reCAPTCHA V3 Site Key.", "color: green; font-weight: bold;");
          appCheckInstance = initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(reCaptchaKey),
            isTokenAutoRefreshEnabled: true
          });
          console.log("%cFirebase: App Check initialized (PRODUCTION reCAPTCHA mode).", "color: green;");
        }
      } catch (e: any) {
        console.error("%cFirebase: App Check initialization FAILED.", "color: red; font-weight: bold;", e);
        appCheckInstance = null;
      }
      
      // Optional Analytics initialization
      // if (firebaseConfig.measurementId) { ... }

      if (authInstance && dbInstance && storageInstance) {
          console.log("%cFirebase: SDK core services (Auth, Firestore, Storage) initialized successfully.", "color: green; font-weight: bold;");
      } else {
          let missingServices = [];
          if (!authInstance) missingServices.push("Auth");
          if (!dbInstance) missingServices.push("Firestore");
          if (!storageInstance) missingServices.push("Storage");
          console.warn(`%cFirebase: One or more core Firebase services FAILED to initialize: [${missingServices.join(', ')}]. App functionality related to these services will be affected.`, "color: orange; font-weight: bold;");
      }
       if (!appCheckInstance) {
          console.warn("%cFirebase: App Check instance is NULL after initialization attempt. If App Check is enforced, Firebase services might fail.", "color: orange; font-weight: bold;");
      }

    } else { // app is null, undefined, or not a valid FirebaseApp instance
      console.error("%cCRITICAL: Firebase app object is null, undefined, or not a valid FirebaseApp instance after initialization attempt. Firebase services will be unavailable. All Firebase instances set to null.", "color: red; font-weight: bold; font-size: 1.3em;");
      app = null; 
      authInstance = null;
      dbInstance = null;
      storageInstance = null;
      appCheckInstance = null;
      // analytics = null;
    }
  } catch (e: any) { // Catch any error from the outer try block, including the API key check error
    console.error("%cCRITICAL FIREBASE INITIALIZATION ERROR (Outer Catch):", "color: red; font-weight: bold; font-size: 1.3em;", e);
    app = null; 
    authInstance = null;
    dbInstance = null;
    storageInstance = null;
    appCheckInstance = null;
    // analytics = null;
  }
} else {
  // console.log("Firebase: SDK not initialized (server-side or window undefined).");
}

export { app, authInstance as auth, dbInstance as db, storageInstance as storage, appCheckInstance as appCheck /*, analytics */ };
