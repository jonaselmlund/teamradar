import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import uuid from 'react-native-uuid';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

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
        if (!userId) {
            alert("Användar-ID saknas. Kan inte gå med i teamet.");
            return;
        }

        const teamQuery = query(collection(db, "teams"), where("teamCode", "==", teamCodeInput));
        const teamSnapshot = await getDocs(teamQuery);

        if (!teamSnapshot.empty) {
            const teamDoc = teamSnapshot.docs[0];
            const teamId = teamDoc.id;

            // Ensure teamId is not undefined
            if (!teamId) {
                alert("Team-koden är ogiltig!");
                return;
            }

            // Update the user's document with the teamId and isAdmin fields
            await updateDoc(doc(db, "users", userId), {
                teamId: teamId,
                isAdmin: false
            });

            // Add the user to the team's members collection
            const userDoc = await getDoc(doc(db, "users", userId));
            const username = userDoc.data().username;

            await addDoc(collection(db, "teams", teamId, "members"), {
                userId: userId,
                username: username,
                isAdmin: false
            });

            alert("Gick med i teamet!");
            if (setTeam) setTeam(teamId);
            if (setTeamName) setTeamName(teamDoc.data().name);
            if (startTrackingPosition) startTrackingPosition();
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

export const startTrackingPosition = async (inactiveHoursStart, inactiveHoursEnd, updateFrequency) => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            return;
        }

        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            console.log('Ingen userId hittad i local storage');
            return;
        }

        const userRef = doc(db, 'users', userId);

        // Watch the user's position continuously
        Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: updateFrequency, // Minimum time interval between updates
                distanceInterval: 10, // Minimum distance (in meters) between updates
            },
            async (location) => {
                const currentHour = new Date().getHours();

                // Check if the current time is within inactive hours
                if (
                    (inactiveHoursStart < inactiveHoursEnd &&
                        currentHour >= inactiveHoursStart &&
                        currentHour < inactiveHoursEnd) ||
                    (inactiveHoursStart > inactiveHoursEnd &&
                        (currentHour >= inactiveHoursStart || currentHour < inactiveHoursEnd))
                ) {
                    console.log('Inactive hours, not updating position');
                    return;
                }

                // Update the user's position in Firestore
                await updateDoc(userRef, {
                    location: {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        timestamp: location.timestamp,
                    },
                });

                console.log('Position updated:', location);
            }
        );

        console.log('Started tracking position');
    } catch (error) {
        console.error('Error starting position tracking:', error);
    }
};

