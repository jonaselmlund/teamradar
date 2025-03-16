import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Switch, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { fetchUserData, fetchTeamData, fetchMembers, createTeam, joinTeam, toggleAdminStatus, deleteTeam, createTestUser, removeUserFromTeam, updateTeamName } from '../utils/teamUtils';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TeamScreen = () => {
    const [teamName, setTeamName] = useState('');
    const [isEditingTeamName, setIsEditingTeamName] = useState(false);
    const [inactiveHoursStart, setInactiveHoursStart] = useState(22);
    const [inactiveHoursEnd, setInactiveHoursEnd] = useState(7);
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [teamCode, setTeamCode] = useState('');
    const [user, setUser] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        fetchUserData(setUser);
    }, []);

    useEffect(() => {
        if (user) {
            const unsubscribe = onSnapshot(doc(db, 'users', user.userId), (doc) => {
                const userData = doc.data();
                if (userData.teamId) {
                    fetchTeamData(userData.teamId, setTeam, (teamId) => fetchMembers(teamId, setMembers));
                }
            });
            return () => unsubscribe();
        }
    }, [user]);

    const handleMemberPress = (member) => {
        navigation.navigate('MapScreen', { member });
    };

    const handleRemoveUser = async (memberId) => {
        try {
            await removeUserFromTeam(team.id, memberId);
            Alert.alert('Success', 'User removed from the team.');
            console.log(`User ${memberId} removed from team ${team.id}`);
            fetchMembers(team.id, setMembers); // Refresh the members list
        } catch (error) {
            console.error('Error removing user from team:', error);
        }
    };

    const handleUpdateTeamName = async () => {
        try {
            console.log('Updating team name with:', teamName);
            await updateTeamName(team.id, teamName);
            Alert.alert('Success', 'Team name updated.');
            setIsEditingTeamName(false);
        } catch (error) {
            console.error('Error updating team name:', error);
        }
    };

    const handleToggleAdminStatus = async (memberId, isAdmin) => {
        try {
            console.log('memberId:', memberId);
            console.log('isAdmin:', isAdmin);
            console.log('team.id:', team.id);
            await toggleAdminStatus(team.id, memberId, !isAdmin);
            fetchMembers(team.id, setMembers); // Refresh the members list
        } catch (error) {
            console.error('Error toggling admin status:', error);
        }
    };

    const handleCreateTestUser = async () => {
        if (team.isLockedForNewMembers) {
            Alert.alert('Teamet tar inte emot nya medlemmar. Prata med en teamadministratör.');
            return;
        }
        await createTestUser(team.id, setMembers);
    };

    const renderHeader = () => (
        <View style={tw`p-4`}>
            <Text style={[tw`text-lg mb-4`, { textAlign: 'center' }]}>Team: {team.name}</Text>
            {user.isAdmin && (
                <View>
                    {isEditingTeamName ? (
                        <View>
                            <TextInput
                                value={teamName}
                                onChangeText={setTeamName}
                                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
                            />
                            <TouchableOpacity
                                style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-3 flex-row justify-center items-center`}
                                onPress={handleUpdateTeamName}
                            >
                                <Icon name="save" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Spara</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={tw`bg-gray-500 p-2 rounded-lg shadow-md flex-row justify-center items-center`}
                                onPress={() => setIsEditingTeamName(false)}
                            >
                                <Icon name="cancel" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Avbryt</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <TouchableOpacity
                                style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-2 flex-row justify-center items-center`}
                                onPress={() => { setTeamName(team.name); setIsEditingTeamName(true); }}
                            >
                                <Icon name="edit" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Ändra teamnamn</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-2 flex-row justify-center items-center`}
                                onPress={() => navigation.navigate('TeamSettingsScreen', { teamId: team.id })}
                            >
                                <Icon name="settings" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Teaminställningar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-2 flex-row justify-center items-center`}
                                onPress={() => navigation.navigate('ExtraFunctionsScreen', { teamMembers: members })}
                            >
                                <Icon name="functions" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Extra Funktioner</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
            <Text style={tw`text-sm mb-2`}>Tid på dygnet när kartan inte uppdateras: {team.inactiveHours.start} - {team.inactiveHours.end}</Text>
            <Text style={tw`text-sm mb-2`}>Använd denna QR-kod för att bjuda in andra till teamet:</Text>
            <View style={tw`justify-center items-center`}>
                <QRCode style={tw`self-center mb-4`} value={team.teamCode} size={100} />
            </View>
            <Text style={[tw`text-sm mt-2 mb-2`, { textAlign: 'center' }]}>Teamkod, kan användas istället för QR-kod:</Text>
            <Text style={[tw`text-2xl font-bold mb-2`, { textAlign: 'center' }]}>{team.teamCode}</Text>

            <TouchableOpacity
                style={tw`bg-green-500 p-2 rounded-lg shadow-md w-full max-w-md mt-1 flex-row justify-center items-center`}
                onPress={() => navigation.navigate('MapScreen')}
            >
                <Icon name="map" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-1`}>Visa Karta</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={tw`bg-green-500 p-2 rounded-lg shadow-md w-full max-w-md mt-1 flex-row justify-center items-center`}
                onPress={() => navigation.navigate('ChatScreen')}
            >
                <Icon name="chat" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Chat</Text>
            </TouchableOpacity>
            <Text style={tw`text-sm mt-2 mb-2`}>Medlemmar i teamet. (Ändra administratör-status med spaken):</Text>
        </View>
    );

    const renderFooter = () => (
        <View style={tw`p-4`}>
            <TouchableOpacity
                style={tw`bg-red-500 p-2 rounded-lg shadow-md w-full max-w-md mt-1 flex-row justify-center items-center`}
                onPress={() => deleteTeam(team, user, setTeam, setMembers)}
            >
                <Icon name="delete-forever" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-1`}>Radera Team</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={tw`bg-gray-500 p-2 rounded-lg shadow-md w-full max-w-md mt-1 flex-row justify-center items-center`}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-1`}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md mt-1 flex-row justify-center items-center`}
                onPress={handleCreateTestUser}
            >
                <Icon name="person-add" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Skapa Testanvändare</Text>
            </TouchableOpacity>
        </View>
    );

    if (team) {
        return (
            <FlatList
                data={members}
                keyExtractor={(item) => item.userId}
                renderItem={({ item }) => (
                    <View style={tw`flex-row justify-between items-center p-0 mb-1 bg-gray-200 rounded-lg shadow`}>
                        <TouchableOpacity onPress={() => handleMemberPress(item)}>
                            <Text style={tw`text-sm`}>{item.username} {item.isAdmin ? "(Administratör)" : ""}</Text>
                        </TouchableOpacity>
                        <Switch
                            value={item.isAdmin}
                            onValueChange={() => handleToggleAdminStatus(item.userId, item.isAdmin)}
                        />
                        {user.isAdmin && user.userId !== item.userId && (
                            <TouchableOpacity
                                style={tw`bg-red-500 p-1 rounded-lg shadow-md flex-row justify-center items-center`}
                                onPress={() => handleRemoveUser(item.userId)}
                            >
                                <Icon name="delete" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Ta bort</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                contentContainerStyle={tw`p-4`}
                ListFooterComponentStyle={tw`mb-4`}
            />
        );
    }

    return (
        <ScrollView style={tw`flex-1 bg-gray-100`}>
            <View style={tw`flex-1 justify-center items-center p-6`}>
                <Text style={tw`text-lg mb-4`}>Skapa nytt team</Text>
                <TextInput
                    placeholder="Team-namn"
                    value={teamName}
                    onChangeText={setTeamName}
                    style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white w-full max-w-md`}
                />
                <Text style={tw`text-sm mb-2`}>Sätt nattläge, de timmar på dygnet när kartan inte uppdateras.</Text>
                <Text style={tw`text-sm mb-2`}>Från:</Text>
                <TextInput
                    placeholder="Inactive Hours Start"
                    value={inactiveHoursStart.toString()}
                    onChangeText={(text) => setInactiveHoursStart(Number(text))}
                    keyboardType="numeric"
                    style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white w-full max-w-md`}
                />
                <Text style={tw`text-sm mb-2`}>Till:</Text>
                <TextInput
                    placeholder="Inactive Hours End"
                    value={inactiveHoursEnd.toString()}
                    onChangeText={(text) => setInactiveHoursEnd(Number(text))}
                    keyboardType="numeric"
                    style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white w-full max-w-md`}
                />
                <Text style={tw`text-sm mb-4`}>Sätt samma tid i från och till om du vill skippa nattläge.</Text>
                <TouchableOpacity
                    style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md flex-row justify-center items-center`}
                    onPress={() => createTeam(teamName, inactiveHoursStart, inactiveHoursEnd, user, setTeamName, setTeam)}
                >
                    <Icon name="group-add" size={20} color="white" />
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Skapa Team</Text>
                </TouchableOpacity>
                <Text style={tw`text-lg mt-4 mb-4`}>Vill du istället gå med i ett befintligt team?</Text>
                <Text style={tw`text-sm mb-4`}>Du behöver en teamkod eller en QR-kod du kan scanna</Text>
                <TouchableOpacity
                    style={tw`bg-gray-500 p-2 rounded-lg shadow-md w-full max-w-md flex-row justify-center items-center`}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-back" size={20} color="white" />
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Gå tillbaka för att gå med i team</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default TeamScreen;
