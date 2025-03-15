import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, onSnapshot, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

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

export const fetchMembers = (teamId, setMembers) => {
    const unsubscribe = onSnapshot(collection(db, "teams", teamId, "members"), (snapshot) => {
        const membersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(membersList);
    });
    return () => unsubscribe();
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

export const toggleAdminStatus = async (teamId, memberId, isAdmin, members) => {
    if (members.length === 1) {
        alert("Det måste finnas minst en admin.");
        return;
    }
    await updateDoc(doc(db, "teams", teamId, "members", memberId), {
        isAdmin: !isAdmin
    });
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

export const createTestUser = async (teamId, setMembers) => {
    const generateRandomUsername = () => {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        let username = '';
        for (let i = 0; i < 4; i++) {
            username += letters[Math.floor(Math.random() * letters.length)];
        }
        return username + '-test-user';
    };

    const generateRandomCoordinates = () => {
        const latBase = 59.6498;
        const lonBase = 17.9238;
      
        const latRandom = (Math.random() * 0.0001).toFixed(4); // Generates a random value between 0.0000 and 0.0001
        const lonRandom = (Math.random() * 0.0001).toFixed(4);
      
        const latitude = parseFloat((latBase + Number(latRandom)).toFixed(8));
        const longitude = parseFloat((lonBase + Number(lonRandom)).toFixed(8));
      
        return { latitude, longitude };
      };

    const testUser = {
        username: generateRandomUsername(),
        notificationSetting: true,
        chatNotificationSetting: true,
        latitude: generateRandomCoordinates().latitude,
        longitude: generateRandomCoordinates().longitude,
        teamId: teamId,
        isAdmin: false
    };

    try {
        const testUserRef = await addDoc(collection(db, "users"), testUser);
        await addDoc(collection(db, "teams", teamId, "members"), {
            userId: testUserRef.id,
            username: testUser.username,
            isAdmin: false
        });

        alert("Testanvändare skapad och tillagd i teamet!");
        fetchMembers(teamId, setMembers);
    } catch (error) {
        console.error("Fel vid skapande av testanvändare:", error);
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

export const removeUserFromTeam = async (teamId, userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        console.log('Removing user from team:', userId);
        console.log('User ref:', userRef);
        console.log('Team ID:', teamId);
        
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.log(`No user document found for userId: ${userId}`);
            return;
        }

        await updateDoc(userRef, { teamId: null });

        // Remove user from team's members collection
        const memberRef = query(collection(db, "teams", teamId, "members"), where("userId", "==", userId));
        const memberSnapshot = await getDocs(memberRef);
        memberSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });

        console.log(`User ${userId} removed from team ${teamId}`);
    } catch (error) {
        console.error('Error removing user from team:', error);
    }
};