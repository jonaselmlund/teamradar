import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';



// Fallback for environments where Constants.expoConfig or Constants.manifest is null
const firebaseConfig = {
    //apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    //authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    //projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    //storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    //messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    //appId: process.env.REACT_APP_FIREBASE_APP_ID,
    apiKey: "AIzaSyD7vhdeLqD2iLDmQ56bxE1nzH9C3NTJstE",
    authDomain: "teamradar-c118e.firebaseapp.com",
    projectId: "teamradar-c118e",
    storageBucket: "teamradar-c118e.appspot.com",
    messagingSenderId: "293037580610",
    appId: "1:293037580610:web:7dc37a0aed470e0c6068db",
   

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, signInAnonymously, db };
