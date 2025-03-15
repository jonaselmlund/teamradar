import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList, Switch, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { fetchUserData, fetchTeamData, fetchMembers, createTeam, joinTeam, toggleAdminStatus, deleteTeam, createTestUser, removeUserFromTeam } from '../utils/teamUtils';
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

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
    fetchUserData(setUser);
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, "users", user.userId), (doc) => {
        const userData = doc.data();
        if (userData.teamId) {
          fetchTeamData(userData.teamId, setTeam, (teamId) => fetchMembers(teamId, setMembers));
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleMemberPress = (member) => {
    navigation.navigate("MapScreen", { member });
  };

  const handleRemoveUser = async (memberId) => {
    try {
      await removeUserFromTeam(team.id, memberId);
      Alert.alert("Success", "User removed from the team.");
      console.log(`User ${memberId} removed from team ${team.id}`);
      fetchMembers(team.id, setMembers); // Refresh the members list
    } catch (error) {
      console.error("Error removing user from team:", error);
    }
  };

  if (team) {
    return (
      <View style={{ padding: 20, flex: 1 }}>
        <Text style={{ fontSize: 20, marginBottom: 10 }}>Team: {team.name}</Text>
        <Text>Timmar på dygnet när kartan inte uppdateras: {team.inactiveHours.start} - {team.inactiveHours.end}</Text>
        <Text>Använd denna QR-kod för att bjuda in andra till teamet:</Text>
        <QRCode style={{ alignItem: 'center' }} value={team.teamCode} size={180} />
        <Text>Teamkod, kan användas istället för QR-kod:</Text>
        <Text style={{ fontSize: 40, fontWeight: 'bold' }}>{team.teamCode}</Text>
        <Text>Medlemmar i teamet, tryck på ett namn för att visa kartan. (Ändra administratör-status med spaken till höger):</Text>
        <FlatList
          data={members}
          keyExtractor={(item) => item.userId} // Ensure the correct user ID is used
          renderItem={({ item }) => (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10 }}>
              <TouchableOpacity onPress={() => handleMemberPress(item)}>
                <Text>{item.username} {item.isAdmin ? "(Administratör)" : ""}</Text>
              </TouchableOpacity>
              <Switch
                value={item.isAdmin}
                onValueChange={() => toggleAdminStatus(team.id, item.userId, item.isAdmin, members)}
              />
              {user.isAdmin && user.userId !== item.userId && (
                <Button title="ta bort" onPress={() => handleRemoveUser(item.userId)} />
              )}
            </View>
          )}
        />
        <Button title="Radera Team" onPress={() => deleteTeam(team, user, setTeam, setMembers)} />
        <Button title="Visa Karta" onPress={() => navigation.navigate("MapScreen")} />
        <Button title="Chat" onPress={() => navigation.navigate("ChatScreen")} />
        <Button title="Back" onPress={() => navigation.goBack()} />
        <Button title="Skapa Testanvändare" onPress={() => createTestUser(team.id, setMembers)} />
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
      <Text>Sätt nattläge, de timmar på dygnet när kartan inte uppdateras.</Text>
      <Text>Från:</Text>
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
      <Text>Till:</Text>
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
      <Text>(Sätt samma tid i från och till om du vill skippa nattläge.)</Text>
      <Button title="Skapa Team" onPress={() => createTeam(teamName, inactiveHoursStart, inactiveHoursEnd, user, setTeamName, setTeam)} />
      <Text style={{ fontSize: 20, marginTop: 20, marginBottom: 10 }}>Vill du istället gå med i ett befintligt team?</Text>
      <Text>(Du behöver en teamkod eller en QR-kod du kan scanna)</Text>
      
      <Button title="Gå tillbaka för att gå med i team." onPress={() => navigation.goBack()} /> 
    </View>
  );
};

export default TeamScreen;
