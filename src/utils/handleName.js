import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import uuid from 'react-native-uuid';

export const fetchUsernameFromFirestore = async (setStoredName, setTeam, setTeamName) => {
    try {
        const storedUserId = await AsyncStorage.getItem('userId');
        
        if (!storedUserId) {
            console.log('Ingen userId hittad i local storage');
            return;
        }

        const userRef = doc(db, 'users', storedUserId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            setStoredName(docSnap.data().username);
            const teamId = docSnap.data().teamId ? docSnap.data().teamId : null;
            setTeam(teamId);
            if (teamId) {
                const teamRef = doc(db, 'teams', teamId);
                const teamSnap = await getDoc(teamRef);
                if (teamSnap.exists()) {
                    setTeamName(teamSnap.data().name);
                }
            }
            console.log('Hämtat namn från Firestore:', docSnap.data().username);
        } else {
            console.log('Inget användarnamn hittat i Firestore');
        }
    } catch (error) {
        console.error('Fel vid hämtning av användarnamn:', error);
    }
};

export const handleSaveName = async (username, notificationSetting, chatNotificationSetting, setStoredName) => {
    try {
        let storedUserId = await AsyncStorage.getItem('userId');

        if (!storedUserId) {
            storedUserId = uuid.v4().toString();
            await AsyncStorage.setItem('userId', storedUserId);
            console.log('Genererade nytt userId:', storedUserId);
        }

        const userRef = doc(db, 'users', storedUserId);
        await setDoc(userRef, {
            username,
            notificationSetting,
            chatNotificationSetting
        });

        setStoredName(username);
        console.log(`Sparade till Firestore: User ID: ${storedUserId}, Username: ${username}`);
    } catch (error) {
        console.error('Fel vid sparande av namn:', error);
    }
};

export const handleResetApp = async (setStoredName, setUsername, setUserId, setTeam, setTeamName) => {
    try {
        const storedUserId = await AsyncStorage.getItem('userId');

        if (!storedUserId) {
            console.log('Ingen användare att radera.');
            return;
        }

        const userRef = doc(db, 'users', storedUserId);
        await deleteDoc(userRef);
        console.log(`Användare raderad från Firestore:  ${storedUserId}`);

        await AsyncStorage.removeItem('userId');
        await AsyncStorage.clear();

        setStoredName(null);
        setUsername('');
        setUserId(null);
        setTeam(null);
        setTeamName('');

        console.log('Local Storage rensat.');
    } catch (error) {
        console.error('Fel vid reset av app:', error);
    }
};

export const handleJoinTeamWithCode = async (teamCodeInput, userId, setTeam, setTeamName, startTrackingPosition) => {
    if (!teamCodeInput.trim()) {
        alert("Ange en team-kod!");
        return;
    }

    try {
        const teamDoc = await getDoc(doc(db, "teams", teamCodeInput));
        if (teamDoc.exists()) {
            await updateDoc(doc(db, "users", userId), {
                teamId: teamCodeInput,
                isAdmin: false
            });

            alert("Gick med i teamet!");
            setTeam(teamCodeInput);
            setTeamName(teamDoc.data().name);
            startTrackingPosition();
        } else {
            alert("Team-koden är ogiltig!");
        }
    } catch (error) {
        console.error("Fel vid anslutning till team:", error);
    }
};

export const handleBarCodeScanned = async ({ type, data }, userId, setTeam, setTeamName, startTrackingPosition) => {
    console.log(`PLACE !`);
    try {
        console.log(`Scanned barcode of type ${type} with data: ${data}`);
        const teamDoc = await getDoc(doc(db, "teams", data));
        if (teamDoc.exists()) {
            if (!userId) {
                alert("Användar-ID saknas. Kan inte gå med i teamet.");
                return;
            }
            await updateDoc(doc(db, "users", userId), {
                teamId: data,
                isAdmin: false
            });
            alert("Gick med i teamet!");
            setTeam(data);
            setTeamName(teamDoc.data().name);
            startTrackingPosition();
        } else {
            alert("Team-koden är ogiltig!");
        }
    } catch (error) {
        console.error("Fel vid anslutning till team:", error);
        alert("Något gick fel vid anslutning till teamet.");
    }
};

