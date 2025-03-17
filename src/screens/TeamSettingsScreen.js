import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TeamSettingsScreen = ({ route }) => {
    const { teamId } = route.params;
    const [team, setTeam] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [maxMembers, setMaxMembers] = useState('');
    const [inactiveHoursStart, setInactiveHoursStart] = useState(22);
    const [inactiveHoursEnd, setInactiveHoursEnd] = useState(7);
    const [isLockedForNewMembers, setIsLockedForNewMembers] = useState(false);
    const [informationText, setInformationText] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        const fetchTeamData = async () => {
            const teamRef = doc(db, 'teams', teamId);
            const teamDoc = await getDoc(teamRef);
            if (teamDoc.exists()) {
                const teamData = teamDoc.data();
                setTeam(teamData);
                setTeamName(teamData.name);
                setMaxMembers(teamData.maxMembers.toString());
                setInactiveHoursStart(teamData.inactiveHours.start);
                setInactiveHoursEnd(teamData.inactiveHours.end);
                setIsLockedForNewMembers(teamData.isLockedForNewMembers);
                setInformationText(teamData.informationText);
            }
        };

        fetchTeamData();
    }, [teamId]);

    const handleUpdateTeamSettings = async () => {
        try {
            const updatedSettings = {
                name: teamName,
                maxMembers: parseInt(maxMembers),
                inactiveHours: {
                    start: parseInt(inactiveHoursStart),
                    end: parseInt(inactiveHoursEnd)
                },
                isLockedForNewMembers,
                informationText
            };
            console.log('Updating team settings with:', updatedSettings);
            console.log('Team ID:', teamId);
            await updateDoc(doc(db, 'teams', teamId), updatedSettings);
            Alert.alert('Allt gick bra', 'Teaminställningar sparade.');
        } catch (error) {
            console.error('Error updating team settings:', error);
        }
    };

    const handleExtendExpiryDate = async () => {
        try {
            const newExpiryDate = new Date(team.expiryDate);
            newExpiryDate.setDate(newExpiryDate.getDate() + 3);
            await updateDoc(doc(db, 'teams', teamId), { expiryDate: newExpiryDate.toISOString() });
            setTeam({ ...team, expiryDate: newExpiryDate.toISOString() });
            Alert.alert('Success', 'Team expiry date extended by 3 days.');
        } catch (error) {
            console.error('Error extending expiry date:', error);
        }
    };

    if (!team) {
        return (
            <View style={tw`flex-1 p-4 bg-gray-100`}>
                <Text style={tw`text-lg mb-4 text-center`}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={tw`flex-1 p-4 bg-gray-100`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mb-4`}>
                <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={tw`text-lg mb-4 text-center`}>Team Settings</Text>
            <TextInput
                placeholder="Team Name"
                value={teamName}
                onChangeText={setTeamName}
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
            />
            <TextInput
                placeholder="Max Members"
                value={maxMembers}
                onChangeText={setMaxMembers}
                keyboardType="numeric"
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
            />
            <TextInput
                placeholder="Inactive Hours Start"
                value={inactiveHoursStart.toString()}
                onChangeText={(text) => setInactiveHoursStart(Number(text))}
                keyboardType="numeric"
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
            />
            <TextInput
                placeholder="Inactive Hours End"
                value={inactiveHoursEnd.toString()}
                onChangeText={(text) => setInactiveHoursEnd(Number(text))}
                keyboardType="numeric"
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
            />
            <TextInput
                placeholder="Information Text"
                value={informationText}
                onChangeText={setInformationText}
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
            />
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-sm`}>Lock for New Members</Text>
                <Switch
                    value={isLockedForNewMembers}
                    onValueChange={setIsLockedForNewMembers}
                />
            </View>
            <TouchableOpacity
                style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-4 flex-row justify-center items-center`}
                onPress={handleUpdateTeamSettings}
            >
                <Icon name="save" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Save Settings</Text>
            </TouchableOpacity>
            <Text style={tw`text-sm mb-2`}>Expiry Date: {new Date(team.expiryDate).toLocaleDateString()}</Text>
            <TouchableOpacity
                style={tw`bg-green-500 p-2 rounded-lg shadow-md flex-row justify-center items-center`}
                onPress={handleExtendExpiryDate}
            >
                <Icon name="date-range" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Extend Expiry Date by 3 Days</Text>
            </TouchableOpacity>
        </View>
    );
};

export default TeamSettingsScreen;