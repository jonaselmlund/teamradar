import { collection, addDoc, doc, updateDoc, getDoc, onSnapshot, deleteDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchMembers = (teamId, setMembers) => {
    const unsubscribe = onSnapshot(collection(db, "teams", teamId, "members"), (snapshot) => {
        const membersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMembers(membersList);
    });
    return () => unsubscribe();
};

export const toggleAdminStatus = async (teamId, memberId, isAdmin) => {
    const memberRef = query(collection(db, "teams", teamId, "members"), where("userId", "==", memberId));
    const memberSnapshot = await getDocs(memberRef);
    if (!memberSnapshot.empty) {
        const memberDoc = memberSnapshot.docs[0];
        await updateDoc(memberDoc.ref, { isAdmin });
    } else {
        throw new Error('Member not found');
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

export const removeUserFromTeam = async (teamId, userId) => {
    try {
        const userRef = doc(db, 'users', userId);
        console.log('Removing user from team. userid=', userId);
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

        
                // Stop tracking the user's position
                stopTrackingPosition();
        
                alert("Du har lämnat teamet.");

        console.log(`User ${userId} removed from team ${teamId}`);
    } catch (error) {
        console.error('Error removing user from team:', error);
    }
};