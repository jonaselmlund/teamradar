import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, onSnapshot, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { fetchMembers, toggleAdminStatus, createTestUser, removeUserFromTeam } from './memberUtils';

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
            teamCode: teamCode
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
        setTeam({ id: teamRef.id, name: teamName, inactiveHours: { start: inactiveHoursStart, end: inactiveHoursEnd }, teamCode });
    } catch (error) {
        console.error("Fel vid skapande av team:", error);
    }
};

export const joinTeam = async (teamCode, user, fetchTeamData, startTrackingPosition) => {
    if (!teamCode.trim()) {
        alert("Ange en team-kod!");
        return;
    }

    if (!user) {
        alert("Ingen giltig användare.");
        return;
    }

    try {
        const teamDoc = await getDoc(doc(db, "teams", teamCode));
        if (teamDoc.exists()) {
            await updateDoc(doc(db, "users", user.userId), {
                teamId: teamCode,
                isAdmin: false
            });

            await addDoc(collection(db, "teams", teamCode, "members"), {
                userId: user.userId,
                username: user.username,
                isAdmin: false
            });

            alert("Gick med i teamet!");
            fetchTeamData(teamCode);
            startTrackingPosition();
        } else {
            alert("Team-koden är ogiltig!");
        }
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

export const startTrackingPosition = async (inactiveHoursStart, inactiveHoursEnd) => {
    const updatePosition = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const currentHour = new Date().getHours();

        if (currentHour >= inactiveHoursStart || currentHour < inactiveHoursEnd) {
            console.log('Inactive hours, not updating position.');
            return;
        }

        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
        }
    };

    setInterval(updatePosition, 60000); // Default to 1 minute
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
    await updateDoc(teamRef, settings);
};