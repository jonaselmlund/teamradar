import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Se till att Firebase är korrekt konfigurerat

const ExtraFunctionsScreen = ({ route }) => {
    const { teamMembers = [], teamId = null } = route.params || {}; // Fallback för teamId
    const [groups, setGroups] = useState([]);
    const [teamEconomyEnabled, setTeamEconomyEnabled] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchTeamEconomyStatus = async () => {
            try {
                if (!teamId) {
                    console.error('teamId saknas');
                    return;
                }

                const teamRef = doc(db, 'teams', teamId);
                const teamDoc = await getDoc(teamRef);

                if (teamDoc.exists()) {
                    const data = teamDoc.data();
                    setTeamEconomyEnabled(data.teamEconomyEnabled || false); // Sätt värdet från Firebase
                } else {
                    console.error('Team-dokumentet finns inte i Firebase.');
                }
            } catch (error) {
                console.error('Fel vid hämtning av team-ekonomi-status:', error);
            }
        };

        fetchTeamEconomyStatus();
    }, [teamId]);

    console.log('Route params:', route.params); // Logga för felsökning

    const pickRandomMember = () => {
        if (teamMembers.length === 0) {
            Alert.alert('Inga teammedlemmar', 'Det finns inga teammedlemmar att välja bland.');
            return;
        }
        const randomIndex = Math.floor(Math.random() * teamMembers.length);
        const member = teamMembers[randomIndex];
        Alert.alert('Utvald medlem', `Vald medlem blev: ${member.username}`);
    };

    const createGroups = (numGroups) => {
        if (teamMembers.length === 0) {
            Alert.alert('Inga medlemmar', 'Det finns inga medlemmar att skapa grupper av.');
            return;
        }
        const shuffledMembers = [...teamMembers].sort(() => 0.5 - Math.random());
        const newGroups = Array.from({ length: numGroups }, () => []);
        shuffledMembers.forEach((member, index) => {
            newGroups[index % numGroups].push(member);
        });
        setGroups(newGroups);
    };

    return (
        <View style={tw`flex-1 p-4 bg-gray-100`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mb-4`}>
                <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={tw`text-lg mb-4 text-center`}>Extra funktioner</Text>
            <TouchableOpacity
                style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                onPress={pickRandomMember}
            >
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Välj en slumpmässig teammedlem</Text>
            </TouchableOpacity>

            {/* Skapa 2 grupper */}
            {teamMembers.length > 2 && (
                <TouchableOpacity
                    style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                    onPress={() => createGroups(2)}
                >
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Skapa 2 grupper av teamet</Text>
                </TouchableOpacity>
            )}

            {/* Skapa 3 grupper */}
            {teamMembers.length > 3 && (
                <TouchableOpacity
                    style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                    onPress={() => createGroups(3)}
                >
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Skapa 3 grupper av teamet</Text>
                </TouchableOpacity>
            )}

            {/* Skapa 4 grupper */}
            {teamMembers.length > 4 && (
                <TouchableOpacity
                    style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                    onPress={() => createGroups(4)}
                >
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Skapa 4 grupper av teamet</Text>
                </TouchableOpacity>
            )}

            {groups.length > 0 && (
                <View>
                    <Text style={tw`text-lg mb-4 text-center`}>Grupper</Text>
                    {groups.map((group, index) => (
                        <View key={index} style={tw`mb-4`}>
                            <Text style={tw`text-md mb-2`}>Grupp {index + 1}</Text>
                            {group.map(member => (
                                <Text key={member.id} style={tw`text-sm`}>{member.username}</Text>
                            ))}
                        </View>
                    ))}
                </View>
            )}

            {/* Button for Team Economy */}
            {teamEconomyEnabled && (
                <TouchableOpacity
                    style={tw`bg-green-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                    onPress={() => navigation.navigate('EconomyScreen')}
                >
                    <Icon name="attach-money" size={20} color="white" />
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Gå till team-ekonomi</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default ExtraFunctionsScreen;