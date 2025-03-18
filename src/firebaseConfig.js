import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants'; // Import Constants

// Fallback for environments where Constants.expoConfig or Constants.manifest is null
const firebaseConfig = {
    apiKey: Constants.expoConfig.extra.FIREBASE_API_KEY,
    authDomain: Constants.expoConfig.extra.FIREBASE_AUTH_DOMAIN,
    projectId: Constants.expoConfig.extra.FIREBASE_PROJECT_ID,
    storageBucket: "teamradar-c118e.firebasestorage.app",
    messagingSenderId: "293037580610",
    appId: "1:293037580610:web:7dc37a0aed470e0c6068db"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, signInAnonymously, db };
