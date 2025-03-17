import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: Constants.manifest.extra.FIREBASE_API_KEY,
    authDomain: Constants.manifest.extra.FIREBASE_AUTH_DOMAIN,
    projectId: Constants.manifest.extra.FIREBASE_PROJECT_ID,
    storageBucket: "teamradar-c118e.firebasestorage.app",
    messagingSenderId: "293037580610",
    appId: "1:293037580610:web:7dc37a0aed470e0c6068db"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, signInAnonymously, db };
