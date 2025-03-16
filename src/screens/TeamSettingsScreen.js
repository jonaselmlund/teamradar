import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { fetchTeamData, updateTeamSettings } from '../utils/teamUtils';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TeamSettingsScreen = ({ route }) => {
    const [team, setTeam] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [maxMembers, setMaxMembers] = useState('');
    const [inactiveHoursStart, setInactiveHoursStart] = useState('');
    const [inactiveHoursEnd, setInactiveHoursEnd] = useState('');
    const [isLockedForNewMembers, setIsLockedForNewMembers] = useState(false);
    const [informationText, setInformationText] = useState('');
    const navigation = useNavigation();
    const { teamId } = route.params;

    useEffect(() => {
        if (!teamId) {
            console.error('No teamId provided');
            return;
        }

        const unsubscribe = onSnapshot(doc(db, 'teams', teamId), (doc) => {
            const teamData = doc.data();
            if (teamData) {
                setTeam(teamData);
                setTeamName(teamData.name);
                setMaxMembers(teamData.maxMembers.toString());
                setInactiveHoursStart(teamData.inactiveHours.start.toString());
                setInactiveHoursEnd(teamData.inactiveHours.end.toString());
                setIsLockedForNewMembers(teamData.isLockedForNewMembers || false);
                setInformationText(teamData.informationText || '');
            } else {
                console.error('No team data found');
            }
        }, (error) => {
            console.error('Error fetching team data:', error);
        });

        return () => unsubscribe();
    }, [teamId]);

    const handleUpdateTeamSettings = async () => {
        try {
            if (!team) {
                console.error('Team is not defined');
                return;
            }
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
            await updateTeamSettings(teamId, updatedSettings);
            Alert.alert('Allt gick bra', 'Teaminställningar sparade.');
        } catch (error) {
            console.error('Error updating team settings:', error);
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
            <Text style={tw`text-lg mb-4 text-center`}>Teaminställningar</Text>
            <Text style={tw`text-sm mb-2`}>Teamnamn:</Text>
            <TextInput
                value={teamName}
                onChangeText={setTeamName}
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
            />
            <Text style={tw`text-sm mb-2`}>Max antal medlemmar:</Text>
            <TextInput
                value={maxMembers}
                onChangeText={setMaxMembers}
                keyboardType="numeric"
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
            />
            <Text style={tw`text-sm mb-2`}>Start inaktivitetsperiod:</Text>
            <TextInput
                value={inactiveHoursStart}
                onChangeText={setInactiveHoursStart}
                keyboardType="numeric"
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
            />
            <Text style={tw`text-sm mb-2`}>Slut inaktivitetsperiod:</Text>
            <TextInput
                value={inactiveHoursEnd}
                onChangeText={setInactiveHoursEnd}
                keyboardType="numeric"
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white`}
            />
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-sm`}>Är teamet låst för nya medlemmar?</Text>
                <Switch
                    value={isLockedForNewMembers}
                    onValueChange={setIsLockedForNewMembers}
                />
            </View>
            <Text style={tw`text-sm mb-2`}>Teaminfo/program:</Text>
            <TextInput
                value={informationText}
                onChangeText={setInformationText}
                style={tw`border border-gray-400 rounded-lg p-2 mb-4 bg-white h-32`}
                multiline
                numberOfLines={5}
                 textAlignVertical="top"
            />
            <TouchableOpacity
                style={tw`bg-blue-500 p-2 rounded-lg shadow-md flex-row justify-center items-center`}
                onPress={handleUpdateTeamSettings}
            >
                <Icon name="save" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Spara nya inställningar</Text>
            </TouchableOpacity>
        </View>
    );
};

export default TeamSettingsScreen;