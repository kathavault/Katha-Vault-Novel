
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
// App Check related imports HATA DIYE GAYE HAIN

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

      // App Check initialization code HATA DIYA GAYA HAI

      // Initialize other services
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
      if (storageInstance) serviceCheckMessage += "Storage (OK)."; else { serviceCheckMessage += "Storage (FAIL)."; allGood = false; }
      // App Check status HATA DIYA GAYA HAI
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
