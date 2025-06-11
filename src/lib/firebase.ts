
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
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let appCheckInstance: AppCheck | null = null; // Re-added AppCheck instance
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

      // Initialize Firebase App Check
      const reCaptchaKey = "YOUR_RECAPTCHA_V3_SITE_KEY_PLACEHOLDER";

      if (typeof initializeAppCheck === 'function' && typeof ReCaptchaV3Provider === 'function') {
        try {
          if (reCaptchaKey === "YOUR_RECAPTCHA_V3_SITE_KEY_PLACEHOLDER" || !reCaptchaKey) {
            console.warn("%cFirebase App Check: WARNING - reCAPTCHA v3 Site Key is a PLACEHOLDER. DEBUG TOKEN (`FIREBASE_APPCHECK_DEBUG_TOKEN=true`) has been automatically enabled for local development. For this to work effectively with enforced services, ensure your debug token is registered in the Firebase console OR temporarily disable enforcement for services (Auth, Firestore etc.) if the debug flow fails. You MUST replace the placeholder with a REAL reCAPTCHA v3 Site Key from Google Cloud Console (reCAPTCHA Enterprise) for production and for App Check to function correctly with ENFORCEMENT.", "color: orange; font-weight: bold; font-size: 1.1em; border: 1px solid orange; padding: 5px;");
            (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
            appCheckInstance = initializeAppCheck(app); // No provider uses debug token if flag is set
            console.log("%cFirebase: App Check initialized (attempting DEBUG mode due to placeholder key).", "color: orange; font-weight: bold;");
          } else {
            console.log("%cFirebase App Check: Initializing with provided reCAPTCHA v3 Site Key.", "color: green; font-weight: bold;");
            const provider = new ReCaptchaV3Provider(reCaptchaKey);
            appCheckInstance = initializeAppCheck(app, {
              provider: provider,
              isTokenAutoRefreshEnabled: true,
            });
            console.log("%cFirebase: App Check initialized with reCAPTCHA v3 provider.", "color: green; font-weight: bold;");
          }
        } catch (e: any) {
          console.error("%cFirebase: App Check initialization FAILED.", "color: red; font-weight: bold;", e);
          appCheckInstance = null;
        }
      } else {
        console.error("%cFirebase: App Check SDK functions (initializeAppCheck or ReCaptchaV3Provider) are not available. App Check will not be initialized. Check Firebase SDK installation.", "color: red; font-weight: bold;");
        appCheckInstance = null;
      }

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
