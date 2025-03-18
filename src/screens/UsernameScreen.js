import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera'; 
import RNPickerSelect from 'react-native-picker-select';
import { fetchUsernameFromFirestore, handleSaveName, handleResetApp, handleJoinTeamWithCode, handleBarCodeScanned, showTerms } from '../utils/handleName';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { startTrackingPosition, toggleTracking } from '../utils/teamUtils';

const UsernameScreen = () => {
    const [username, setUsername] = useState('');
    const [storedName, setStoredName] = useState(null);
    const [userId, setUserId] = useState(null);
    const [notificationSetting, setNotificationSetting] = useState(false);
    const [chatNotificationSetting, setChatNotificationSetting] = useState(false);
    const [team, setTeam] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [scanning, setScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [teamCodeInput, setTeamCodeInput] = useState('');
    const [updateFrequency, setUpdateFrequency] = useState(60000); // Default to 1 minute
    const [isTracking, setIsTracking] = useState(true);
    const [termsVisible, setTermsVisible] = useState(false);
    const [termsText, setTermsText] = useState('');
    const [aboutVisible, setAboutVisible] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        fetchUsernameFromFirestore(setStoredName, setTeam, setTeamName);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUsernameFromFirestore(setStoredName, setTeam, setTeamName);
        }, [])
    );

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            console.log('Camera Permission Status:', status);
            if (status === 'granted') {
                setHasPermission(true);
            } else {
                setHasPermission(false);
                Alert.alert('Camera permission is required to scan the QR code');
            }
        })();
    }, []);

    const saveUsername = async () => {
        if (!newUsername.trim()) {
            Alert.alert('Fel', 'Ange ett giltigt namn.');
            return;
        }
        try {
            // Pass arguments in the correct order
            await handleSaveName(
                newUsername,
                notificationSetting, // Boolean value
                chatNotificationSetting, // Boolean value
                setStoredName
            );
            Alert.alert('Sparat', 'Ditt namn och inställningar har sparats.');
        } catch (error) {
            console.error('Fel vid sparande av namn:', error);
            Alert.alert('Fel', 'Kunde inte spara ditt namn.');
        }
    };
    const loadTerms = async () => {
        try {
            const response = await fetch('https://frontix.se/teamradar/terms.txt');
            const terms = await response.text();
           
            setTermsText(terms);
        } catch (error) {
            console.error('Error loading terms:', error);
        }
    };

    const showTerms = async () => {
        await loadTerms();
        setTermsVisible(true);
    };
    if (scanning) {
        return (
            <Camera
                onBarCodeScanned={(data) => handleBarCodeScanned(data, userId, setTeam, setTeamName, () => startTrackingPosition(inactiveHoursStart, inactiveHoursEnd, updateFrequency))}
                style={StyleSheet.absoluteFillObject}
            />
        );
    }

    return (
        <View style={tw`flex-1 justify-center items-center bg-gray-100 p-6`}>
            {storedName ? (
                <>
                    <Text style={tw`text-lg mb-1`}>Välkommen, {storedName || "Gäst"}!</Text>
                    {team ? (
                        <>
                            <Text style={tw`text-lg mb-2`}>Du är med i team: {teamName}</Text>
                            {/* Other team-related UI */}
                            <Text style={tw`text-sm mb-4`}>Just nu är din position {isTracking ? "synlig" : "osynlig"}</Text>

                            <TouchableOpacity
                                style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md mb-3 flex-row justify-center items-center`}
                                onPress={() => {
                                    const inactiveHoursStart = team?.inactiveHours?.start || 0; // Default to 0 if not set
                                    const inactiveHoursEnd = team?.inactiveHours?.end || 0;   // Default to 0 if not set
                                    toggleTracking(isTracking, setIsTracking, inactiveHoursStart, inactiveHoursEnd, updateFrequency);
                                }}
                            >
                                <Icon name={isTracking ? "visibility-off" : "visibility"} size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>
                                    {isTracking ? "Visa mig inte på kartan." : "Jag vill vara synlig på kartan"}
                                </Text>
                            </TouchableOpacity>

                            <View style={tw`flex-row justify-between items-center mb-1 w-full max-w-md`}>
                                <Text style={tw`text-sm`}>Allmäna notifieringar på?</Text>
                                <Switch
                                    value={notificationSetting}
                                    onValueChange={setNotificationSetting}
                                />
                            </View>
                            <View style={tw`flex-row justify-between items-center mb-1 w-full max-w-md`}>
                                <Text style={tw`text-sm`}>Notifieringar från chat på?</Text>
                                <Switch
                                    value={chatNotificationSetting}
                                    onValueChange={setChatNotificationSetting}
                                />
                            </View>
                            <TouchableOpacity
                        style={tw`bg-green-500 p-2 rounded-lg shadow-md w-full max-w-md flex-row justify-center items-center`}
                        onPress={() => navigation.navigate("TeamScreen")}
                    >
                        <Icon name="group" size={20} color="white" />
                        <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Hantera teamet</Text>
                    </TouchableOpacity>
                            <TouchableOpacity
                            
style={tw`bg-red-500 p-2 rounded-lg shadow-md w-full max-w-md mt-3 flex-row justify-center items-center`}
onPress={() => handleResetApp(setStoredName, setUsername, setUserId, setTeam, setTeamName)}
>
<Icon name="restart-alt" size={20} color="white" />
<Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Reset App, ta bort användare och börja om.</Text>
</TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* "Gå med i ett team..." text */}
                            <Text style={tw`text-base mb-4`}>
                                Du går med i ett team genom att scanna en QR-kod eller skriva in en kod som du kan få av en som redan är med i teamet du vill gå med i.
                            </Text>
                            <TouchableOpacity
                                style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md mb-3 flex-row justify-center items-center`}
                                onPress={() => setScanning(true)}
                            >
                                <Icon name="qr-code-scanner" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Gå med i team via QR-kod</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={tw`border border-gray-400 rounded-lg p-2 mb-3 w-full max-w-md`}
                                placeholder="Ange team-kod"
                                value={teamCodeInput}
                                onChangeText={setTeamCodeInput}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity
                                style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md mb-2 flex-row justify-center items-center`}
                                onPress={() => handleJoinTeamWithCode(teamCodeInput, userId, setTeam, setTeamName, () => startTrackingPosition(inactiveHoursStart, inactiveHoursEnd, updateFrequency))}
                            >
                                <Icon name="group-add" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Gå med i team med kod</Text>
                            </TouchableOpacity>
                            {/* "Skapa team" button */}
                            <TouchableOpacity
                                style={tw`bg-green-500 p-2 rounded-lg shadow-md flex-row justify-center items-center`}
                                onPress={() => navigation.navigate("TeamScreen")}
                            >
                                <Icon name="group-add" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>
                                    Skapa team
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
style={tw`bg-red-500 p-2 rounded-lg shadow-md w-full max-w-md mt-3 flex-row justify-center items-center`}
onPress={() => handleResetApp(setStoredName, setUsername, setUserId, setTeam, setTeamName)}
>
<Icon name="restart-alt" size={20} color="white" />
<Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Reset App, ta bort användare och börja om.</Text>
</TouchableOpacity>

                        </>
                    )}
                </>
            ) : (
                <>
                    <Text style={tw`text-base mb-4`}>Inget namn sparat än.</Text>
                    <Text style={tw`text-base mb-4`}>Genom att skapa en användare samtycker du till våra regler och villkor.</Text>
                    <TouchableOpacity onPress={() => showTerms(setTermsVisible, setTermsText)}>
                        <Text style={tw`text-blue-500 underline mb-4`}>Läs våra regler och villkor</Text>
                    </TouchableOpacity>

                    <TextInput
                        style={tw`border border-gray-400 rounded-lg p-2 mb-3 w-full max-w-md`}
                        placeholder="Ange ditt namn"
                        value={newUsername}
                        onChangeText={setNewUsername}
                    />
                    <TouchableOpacity
                        style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md flex-row justify-center items-center`}
                        onPress={saveUsername}
                    >
                        <Icon name="save" size={20} color="white" />
                        <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>
                            Spara namn
                        </Text>
                    </TouchableOpacity>
                </>
            )}
             <Modal
                visible={termsVisible}
                animationType="slide"
                onRequestClose={() => setTermsVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-gray-100 p-6`}>
                    <ScrollView style={tw`w-full max-w-md`}>
                        <Text style={tw`text-lg`}>{termsText}</Text>
                    </ScrollView>
                    <Button title="Stäng" onPress={() => setTermsVisible(false)} />
                </View>
            </Modal>
        </View>
    );
    
};


export default UsernameScreen;
