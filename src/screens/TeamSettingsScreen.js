import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
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
    const [teamEconomyEnabled, setTeamEconomyEnabled] = useState(false);
    const [kudosFunctionalityEnabled, setKudosFunctionalityEnabled] = useState(false);
    const [emergencyButtonEnabled, setEmergencyButtonEnabled] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchTeamData = async () => {
            const teamRef = doc(db, 'teams', teamId);
            const teamDoc = await getDoc(teamRef);
            if (teamDoc.exists()) {
                const teamData = teamDoc.data();
                setTeam({
                    ...teamData,
                    expiryDate: teamData.expiryDate?.toDate ? teamData.expiryDate.toDate() : null, // Konvertera Firestore Timestamp
                });
                setTeamName(teamData.name);
                setMaxMembers(teamData.maxMembers.toString());
                setInactiveHoursStart(teamData.inactiveHours.start);
                setInactiveHoursEnd(teamData.inactiveHours.end);
                setIsLockedForNewMembers(teamData.isLockedForNewMembers || false);
                setInformationText(teamData.informationText || '');
                setTeamEconomyEnabled(teamData.teamEconomyEnabled || false);
                setKudosFunctionalityEnabled(teamData.kudosFunctionalityEnabled || false);
                setEmergencyButtonEnabled(teamData.emergencyButtonEnabled || false);
            }
        };

        fetchTeamData();
    }, [teamId]);

    const handleUpdateTeamSettings = async () => {
        try {
            const updatedSettings = {
                name: teamName,
                maxMembers: parseInt(maxMembers) || 0,
                inactiveHours: {
                    start: parseInt(inactiveHoursStart) || 0,
                    end: parseInt(inactiveHoursEnd) || 0
                },
                isLockedForNewMembers: !!isLockedForNewMembers,
                informationText: informationText || '',
                teamEconomyEnabled: !!teamEconomyEnabled,
                kudosFunctionalityEnabled: !!kudosFunctionalityEnabled,
                emergencyButtonEnabled: !!emergencyButtonEnabled,
            };
            await updateDoc(doc(db, 'teams', teamId), updatedSettings);
            Alert.alert('Allt gick bra', 'Teaminställningar sparade.');
        } catch (error) {
            console.error('Error updating team settings:', error);
        }
    };

    const handleExtendExpiryDate = async () => {
        try {
            const currentExpiryDate = team.expiryDate?.toDate ? team.expiryDate.toDate() : new Date();

            if (isNaN(currentExpiryDate.getTime())) {
                console.error('Invalid expiry date:', team.expiryDate);
                throw new Error('Invalid expiry date');
            }

            const newExpiryDate = new Date(currentExpiryDate);
            newExpiryDate.setDate(newExpiryDate.getDate() + 3);

            await updateDoc(doc(db, 'teams', teamId), { expiryDate: newExpiryDate });

            setTeam({ ...team, expiryDate: newExpiryDate });

            Alert.alert('Allt gick bra.', 'Teamets giltighetstid har utökats med tre dagar.');
        } catch (error) {
            console.error('Error extending expiry date:', error);
            Alert.alert('Fel', 'Kunde inte förlänga teamets giltighetstid. Kontrollera datumformatet.');
        }
    };

    if (!team) {
        return (
            <View style={tw`flex-1 p-4 bg-gray-100`}>
                <Text style={tw`text-lg mb-4 text-center`}>Laddar...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={tw`flex-1 bg-gray-100`} contentContainerStyle={tw`p-4`}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw`mb-4`}>
                <Icon name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={tw`text-lg mb-4 text-center`}>Teaminställningar</Text>
            <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-base mb-1 text-center`}>Teamnamn:</Text>
                <TextInput
                    placeholder="Team Name"
                    value={teamName}
                    onChangeText={setTeamName}
                    style={tw`border border-gray-400 rounded-lg p-2 mb-2 bg-white w-60 text-left`}
                />
            </View>
            <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-base mb-2 text-center`}>Max antal medlemmar i teamet:</Text>
                <TextInput
                    placeholder="Max Members"
                    value={maxMembers}
                    onChangeText={setMaxMembers}
                    keyboardType="numeric"
                    style={tw`border border-gray-400 rounded-lg p-1 mb-1 bg-white w-20 text-center`}
                />
            </View>
            <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-base`}>Nattläge på mellan:</Text>
                <TextInput
                    placeholder="HH"
                    value={inactiveHoursStart.toString()}
                    onChangeText={(text) => setInactiveHoursStart(text.replace(/[^0-9]/g, '').slice(0, 2))}
                    keyboardType="numeric"
                    style={tw`border border-gray-400 rounded-lg p-1 bg-white w-20 text-center`}
                />
                <Text style={tw`text-base`}>och:</Text>
                <TextInput
                    placeholder="HH"
                    value={inactiveHoursEnd.toString()}
                    onChangeText={(text) => setInactiveHoursEnd(text.replace(/[^0-9]/g, '').slice(0, 2))}
                    keyboardType="numeric"
                    style={tw`border border-gray-400 rounded-lg p-1 bg-white w-20 text-center`}
                />
            </View>
            <Text style={tw`text-base mb-2 text-center`}>Teaminfo/program:</Text>
            <TextInput
                value={informationText}
                onChangeText={setInformationText}
                style={tw`border border-gray-400 rounded-lg p-2 mb-2 bg-white h-32`}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
            />
            <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-sm`}>Ska laget vara låst för nya medlemmar?</Text>
                <Switch
                    value={isLockedForNewMembers}
                    onValueChange={setIsLockedForNewMembers}
                />
            </View>
            <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-sm`}>Aktivera ekonomifunktioner</Text>
                <Switch
                    value={teamEconomyEnabled}
                    onValueChange={setTeamEconomyEnabled}
                />
            </View>
            <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-sm`}>Aktivera kudos och grönt kort</Text>
                <Switch
                    value={kudosFunctionalityEnabled}
                    onValueChange={setKudosFunctionalityEnabled}
                />
            </View>
            <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-sm`}>Aktivera nödknapp</Text>
                <Switch
                    value={emergencyButtonEnabled}
                    onValueChange={setEmergencyButtonEnabled}
                />
            </View>
            <TouchableOpacity
                style={tw`bg-blue-500 p-2 rounded-lg shadow-md mb-2 flex-row justify-center items-center`}
                onPress={handleUpdateTeamSettings}
            >
                <Icon name="save" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Spara teaminställningar</Text>
            </TouchableOpacity>
            <Text style={tw`text-sm mb-2`}>Teamets giltighetstid: {new Date(team.expiryDate).toLocaleDateString()}</Text>
            <TouchableOpacity
                style={tw`bg-green-500 p-2 rounded-lg shadow-md flex-row justify-center items-center`}
                onPress={handleExtendExpiryDate}
            >
                <Icon name="date-range" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Förläng teamets giltighet med tre dagar.</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default TeamSettingsScreen;