import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, onSnapshot, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { fetchMembers, toggleAdminStatus, createTestUser, removeUserFromTeam } from './memberUtils';
import { Alert } from "react-native";

let locationWatcher = null;

export const startTrackingPosition = async (inactiveHoursStart, inactiveHoursEnd, updateFrequency = 60000) => {
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
        locationWatcher = await Location.watchPositionAsync(
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

export const stopTrackingPosition = () => {
    if (locationWatcher) {
        locationWatcher.remove(); // Unsubscribe from the location watcher
        locationWatcher = null;
        console.log('Stopped tracking position');
    }
};

export const fetchUserData = async (setUser) => {
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            console.log('Ingen användare hittades i Local Storage.');
            return;
        }
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            setUser({ userId, ...userDoc.data() });
            console.log('Användardata hämtad:', userDoc.data());
        } else {
            console.log('Användaren finns inte i Firestore.');
        }
    } catch (error) {
        console.error('Fel vid hämtning av användardata:', error);
    }
};

export const fetchTeamData = async (teamId, setTeam, fetchMembers) => {
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (teamDoc.exists()) {
        setTeam({ id: teamDoc.id, ...teamDoc.data() });
        fetchMembers(teamId);
        console.log("Teamdata hämtad:", teamDoc.data());
    }
};

export const createTeam = async (teamName, inactiveHoursStart, inactiveHoursEnd, user, setTeamName, setTeam) => {
    if (!teamName.trim()) {
        alert("Ange ett team-namn!");
        return;
    }

    if (!user) {
        alert("Ingen giltig användare.");
        return;
    }

    const generateTeamCode = () => {
        return Math.floor(10000000 + Math.random() * 90000000).toString();
    };

    try {
        const teamCode = generateTeamCode();
        const teamRef = await addDoc(collection(db, "teams"), {
            name: teamName,
            createdAt: serverTimestamp(),
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dagar
            maxMembers: 12,
            inactiveHours: { start: inactiveHoursStart, end: inactiveHoursEnd },
            teamCode: teamCode,
            kudosFunctionalityEnabled: false, // Default to false
            teamEconomyEnabled: false, // Default to false
            emergencyButtonEnabled: false, // Default to false
        });

        await updateDoc(doc(db, "users", user.userId), {
            teamId: teamRef.id,
            isAdmin: true
        });

        await addDoc(collection(db, "teams", teamRef.id, "members"), {
            userId: user.userId,
            username: user.username,
            isAdmin: true
        });

        alert("Team skapat!");
        setTeamName(""); // Töm inputfältet
        setTeam({
            id: teamRef.id,
            name: teamName,
            inactiveHours: { start: inactiveHoursStart, end: inactiveHoursEnd },
            teamCode,
            kudosFunctionalityEnabled: false,
            teamEconomyEnabled: false,
            emergencyButtonEnabled: false,
        });

        // Start tracking the user's position
        startTrackingPosition(inactiveHoursStart, inactiveHoursEnd, 60000); // Example: Update every 60 seconds
    } catch (error) {
        console.error("Fel vid skapande av team:", error);
    }
};

export const joinTeam = async (teamCode, user, setTeam, setTeamName) => {
    try {
        const teamQuery = query(collection(db, "teams"), where("teamCode", "==", teamCode));
        const teamSnapshot = await getDocs(teamQuery);

        if (teamSnapshot.empty) {
            alert("Team med denna kod hittades inte.");
            return;
        }

        const teamDoc = teamSnapshot.docs[0];
        const teamData = teamDoc.data();

        await updateDoc(doc(db, "users", user.userId), {
            teamId: teamDoc.id,
        });

        await addDoc(collection(db, "teams", teamDoc.id, "members"), {
            userId: user.userId,
            username: user.username,
            isAdmin: false,
        });

        alert("Du har gått med i teamet!");
        setTeam(teamData);
        setTeamName(teamData.name);

        // Start tracking the user's position
        startTrackingPosition(teamData.inactiveHours.start, teamData.inactiveHours.end, 60000); // Example: Update every 60 seconds
    } catch (error) {
        console.error("Fel vid anslutning till team:", error);
    }
};

export const deleteTeam = async (team, user, setTeam, setMembers) => {
    try {
        if (!team || !user) {
            alert("Ingen giltig team eller användare.");
            return;
        }

        const teamRef = doc(db, "teams", user.teamId); // 🔥 Hämta ID från användaren istället
        await deleteDoc(teamRef);

        // Delete all chat messages for the team
        const messagesQuery = query(collection(db, 'messages'), where('teamId', '==', user.teamId));
        const messagesSnapshot = await getDocs(messagesQuery);
        messagesSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });

        await updateDoc(doc(db, "users", user.userId), {
            teamId: null,
            isAdmin: false
        });

        setTeam(null);
        setMembers([]);
        alert("Teamet har raderats.");
    } catch (error) {
        console.error("Fel vid radering av team:", error);
    }
};

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
        } else {
            console.log('No such document!');
        }
    } catch (error) {
        console.error('Error fetching username from Firestore:', error);
    }
};

export const updateTeamName = async (teamId, name) => {
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, { name });
};

export const updateTeamSettings = async (teamId, settings) => {
    const teamRef = doc(db, 'teams', teamId);
    try {
        await updateDoc(teamRef, settings);
        console.log("Team settings updated:", settings);
    } catch (error) {
        console.error("Error updating team settings:", error);
    }
};

export const toggleTracking = async (isTracking, setIsTracking, inactiveHoursStart, inactiveHoursEnd, updateFrequency) => {
    try {
        if (isTracking) {
            // Stop tracking
            stopTrackingPosition();
            setIsTracking(false);
            console.log('Position tracking stopped.');
        } else {
            // Start tracking
            await startTrackingPosition(inactiveHoursStart, inactiveHoursEnd, updateFrequency);
            setIsTracking(true);
            console.log('Position tracking started.');
        }
    } catch (error) {
        console.error('Error toggling tracking:', error);
        Alert.alert('Error', 'Kunde inte ändra spårningsstatus.');
    }
};