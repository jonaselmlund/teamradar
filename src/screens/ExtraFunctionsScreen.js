import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ExtraFunctionsScreen = ({ route }) => {
    const { teamMembers = [] } = route.params; // Default to an empty array if teamMembers is undefined
    const [groups, setGroups] = useState([]);
    const navigation = useNavigation();

    const pickRandomMember = () => {
        console.log('Antal medlemmar:', teamMembers.length);
        if (teamMembers.length === 0) {
            Alert.alert('No Members', 'There are no team members to pick from.');
            return;
        }
        const randomIndex = Math.floor(Math.random() * teamMembers.length);
        console.log('randomIndex:', randomIndex);
        const member = teamMembers[randomIndex];
        console.log('Picked Member:', teamMembers[randomIndex].username);
        Alert.alert('Random Member', `Picked Member: ${member.username}`);
    };

    const createGroups = (numGroups) => {
        if (teamMembers.length === 0) {
            Alert.alert('No Members', 'There are no team members to create groups.');
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
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Völj en slumpmässig teammedlem</Text>
            </TouchableOpacity>
            {teamMembers.length > 2 && (
                <TouchableOpacity
                    style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                    onPress={() => createGroups(2)}
                >
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Dela upp teamet i två och två</Text>
                </TouchableOpacity>
            )}
            {teamMembers.length > 2 && (
                <TouchableOpacity
                    style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                    onPress={() => createGroups(3)}
                >
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Dela upp teamet i tre och tre</Text>
                </TouchableOpacity>
            )}
            {teamMembers.length > 3 && (
                <TouchableOpacity
                    style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                    onPress={() => createGroups(3)}
                >
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Skapa 3 grupper av teamet</Text>
                </TouchableOpacity>
            )}
            {teamMembers.length > 3 && (
                <TouchableOpacity
                    style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                    onPress={() => createGroups(4)}
                >
                    <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Skapa 4 grupper av teamet</Text>
                </TouchableOpacity>
            )}
            {groups.length > 0 && (
                <View>
                    <Text style={tw`text-lg mb-4 text-center`}>Groups</Text>
                    {groups.map((group, index) => (
                        <View key={index} style={tw`mb-4`}>
                            <Text style={tw`text-md mb-2`}>Group {index + 1}</Text>
                            {group.map(member => (
                                <Text key={member.id} style={tw`text-sm`}>{member.username}</Text>
                            ))}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

export default ExtraFunctionsScreen;