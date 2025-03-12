import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Switch, Alert } from "react-native";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // 🔥 Importera Firestore
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg'; // Assuming you have a QR code library installed
import { useNavigation } from '@react-navigation/native';  // Import useNavigation hook

const TeamScreen = () => {
  const [teamName, setTeamName] = useState("");
  const [inactiveHoursStart, setInactiveHoursStart] = useState(22);
  const [inactiveHoursEnd, setInactiveHoursEnd] = useState(7);
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [teamCode, setTeamCode] = useState("");
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
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
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, "users", user.userId), (doc) => {
        const userData = doc.data();
        if (userData.teamId) {
          fetchTeamData(userData.teamId);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const fetchTeamData = async (teamId) => {
    const teamDoc = await getDoc(doc(db, "teams", teamId));
    if (teamDoc.exists()) {
        setTeam({ id: teamDoc.id, ...teamDoc.data() }); // 🔥 Lägg till ID!
        fetchMembers(teamId);
    }
};

  const fetchMembers = (teamId) => {
    const unsubscribe = onSnapshot(collection(db, "teams", teamId, "members"), (snapshot) => {
      const membersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(membersList);
    });
    return () => unsubscribe();
  };

  const createTeam = async () => {
    if (!teamName.trim()) {
      alert("Ange ett team-namn!");
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
    } catch (error) {
      console.error("Fel vid skapande av team:", error);
    }
  };

  const joinTeam = async () => {
    if (!teamCode.trim()) {
      alert("Ange en team-kod!");
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
      } else {
        alert("Team-koden är ogiltig!");
      }
    } catch (error) {
      console.error("Fel vid anslutning till team:", error);
    }
  };

  const toggleAdminStatus = async (memberId, isAdmin) => {
    if (members.length === 1) {
      alert("Det måste finnas minst en admin.");
      return;
    }
    await updateDoc(doc(db, "teams", team.id, "members", memberId), {
      isAdmin: !isAdmin
    });
  };

  const deleteTeam = async () => {
    try {
        if (!team || !user) {
            alert("Ingen giltig team eller användare.");
            return;
        }

        const teamRef = doc(db, "teams", user.teamId); // 🔥 Hämta ID från användaren istället
        await deleteDoc(teamRef);

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

  if (team) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>Team: {team.name}</Text>
        <Text>Timmar på dygnet när kartan är låst: {team.inactiveHours.start} - {team.inactiveHours.end}</Text>
        <Text>Använd denna QR-kod för att bjuda in andra till teamet:</Text>
        <QRCode value={team.teamCode} size={150} />
        <Text>Teamkod, kan användas istället för QR-kod: {team.teamCode}</Text>
        <Text>Medlemmar i teamet:</Text>
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10 }}>
              <Text>{item.username} {item.isAdmin ? "(Is admin)" : ""}</Text>
              <Switch
                value={item.isAdmin}
                onValueChange={() => toggleAdminStatus(item.id, item.isAdmin)}
              />
            </View>
          )}
        />
        <Button title="Radera Team" onPress={deleteTeam} />
        <Button title="Visa Karta" onPress={() => navigation.navigate("MapScreen")} />              
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Skapa nytt team</Text>
      <TextInput
        placeholder="Team-namn"
        value={teamName}
        onChangeText={setTeamName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5
        }}
      />
      <TextInput
        placeholder="Inactive Hours Start"
        value={inactiveHoursStart.toString()}
        onChangeText={(text) => setInactiveHoursStart(Number(text))}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5
        }}
      />
      <TextInput
        placeholder="Inactive Hours End"
        value={inactiveHoursEnd.toString()}
        onChangeText={(text) => setInactiveHoursEnd(Number(text))}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5
        }}
      />
      <Button title="Skapa Team" onPress={createTeam} />
      <Text style={{ fontSize: 20, marginTop: 20, marginBottom: 10 }}>Gå med i team</Text>
      <TextInput
        placeholder="Team-kod"
        value={teamCode}
        onChangeText={setTeamCode}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          marginBottom: 10,
          borderRadius: 5
        }}
      />
      <Button title="Gå med i Team" onPress={joinTeam} />
    </View>
  );
};

export default TeamScreen;
