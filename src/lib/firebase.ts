
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
  storageBucket: "katha-vault-g81gj.appspot.com", // Corrected storageBucket format
  messagingSenderId: "613581820650",
  appId: "1:613581820650:web:ae76c0a3ee82bb67627d93"
  // measurementId is optional and was not provided in the new config
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
// let analytics: Analytics; // Optional

// Initialize Firebase
if (getApps().length === 0) {
  if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key is missing. Firebase SDK will not be initialized.");
    // You could throw an error here or handle it as appropriate for your app
    // For now, we'll let it proceed, but services will likely fail.
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize services
// These will throw an error if `app` is not properly initialized (e.g. missing API key)
try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Initialize Analytics only on the client side and if measurementId is available
  // if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  //   analytics = getAnalytics(app);
  // }
} catch (error) {
  console.error("Error initializing Firebase services. This might be due to missing Firebase config values.", error);
  // Fallback or rethrow, depending on how you want to handle critical initialization errors
  // For instance, you might set them to null or a specific error state.
  // For this setup, we'll let them be undefined if initialization fails after the initial app check.
}


export { app, auth, db, storage /*, analytics */ };
