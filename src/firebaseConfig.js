import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔥 DINA FIREBASE-KONFIGURATIONSUPPGIFTER HÄMTAS FRÅN FIREBASE-KONSOLEN 🔥
const firebaseConfig = {
    apiKey: "AIzaSyD7vhdeLqD2iLDmQ56bxE1nzH9C3NTJstE",
    authDomain: "teamradar-c118e.firebaseapp.com",
    projectId: "teamradar-c118e",
    storageBucket: "teamradar-c118e.firebasestorage.app",
    messagingSenderId: "293037580610",
    appId: "1:293037580610:web:fd2504cc8e1c6c666068db"
  };

// Initiera Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Firestore-instans

export { db };
