import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, TouchableOpacity, Modal, ScrollView, Image } from 'react-native';
import tw from 'twrnc';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera'; 
import RNPickerSelect from 'react-native-picker-select';
import { fetchUsernameFromFirestore, handleSaveName, handleResetApp, handleJoinTeamWithCode, handleBarCodeScanned, startTrackingPosition, toggleTracking, showTerms } from '../utils/handleName';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
                    <Text style={tw`text-lg mb-1`}>Välkommen, {storedName || "Gäst" }!</Text>
                    {team ? (
                        <>
                            <Text style={tw`text-lg mb-2`}>Du är med i team: {teamName}</Text>
                            <View style={tw`h-1 bg-black my-1`} />
                            <Text style={tw`text-sm mb-4`}>Hur ofta vill du att din position ska uppdateras?</Text>
                            <RNPickerSelect
                                onValueChange={(value) => setUpdateFrequency(value)}
                                items={[
                                    { label: 'var 10:e sekund, bästa prestanda', value: 10000 },
                                    { label: 'varje minut', value: 60000 },
                                    { label: 'Var 3:e minut', value: 180000 },
                                    { label: 'var 10:e minut, sparar batteri', value: 600000 },
                                ]}
                                style={{
                                    inputIOS: tw`border border-gray-400 rounded-lg p-1 mb-4 bg-white w-full max-w-md`,
                                    inputAndroid: tw`border border-gray-400 rounded-lg p-0.1 mb-2 bg-white w-full max-w-md`,
                                }}
                                value={updateFrequency}
                            />
                            <Text style={tw`text-sm mb-4`}>Just nu är din position {isTracking ? "synlig" : "osynlig"}</Text>

                            <TouchableOpacity
                                style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md mb-3 flex-row justify-center items-center`}
                                onPress={() => toggleTracking(isTracking, setIsTracking, inactiveHoursStart, inactiveHoursEnd, updateFrequency)}
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
                        </>
                    ) : (
                        <>
                            <Text style={tw`text-base mb-4`}>Du är inte med i något team än.</Text>
                            <Text style={tw`text-sm mb-4`}>Du går med i ett team genom att scanna en QR-kod eller skriva in en kod som du kan få av en som redan är med i teamet du vill gå med i.</Text>
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
                                style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md flex-row justify-center items-center`}
                                onPress={() => handleJoinTeamWithCode(teamCodeInput, userId, setTeam, setTeamName, () => startTrackingPosition(inactiveHoursStart, inactiveHoursEnd, updateFrequency))}
                            >
                                <Icon name="group-add" size={20} color="white" />
                                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Gå med i team med kod</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            ) : (
                <>
                     <Text style={tw`text-base mb-4`}>Inget namn sparat än.</Text>
                    <TextInput
                        style={tw`border border-gray-400 rounded-lg p-2 mb-3 w-full max-w-md`}
                        placeholder="Ange ditt namn"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <Text style={tw`text-base mb-4`}>Genom att skapa en användare samtycker du till våra regler och villkor.</Text>
                    <TouchableOpacity onPress={() => showTerms(setTermsVisible, setTermsText)}>
                        <Text style={tw`text-blue-500 underline`}>Läs våra regler och villkor</Text>
                    </TouchableOpacity>
                    <View style={tw`flex-row justify-between items-center mb-3 w-full max-w-md`}>
                        <Text style={tw`text-sm`}>Allmäna notifieringar på?</Text>
                        <Switch
                            value={notificationSetting}
                            onValueChange={setNotificationSetting}
                        />
                    </View>
                    <View style={tw`flex-row justify-between items-center mb-3 w-full max-w-md`}>
                        <Text style={tw`text-sm`}>Notifieringar från chat på?</Text>
                        <Switch
                            value={chatNotificationSetting}
                            onValueChange={setChatNotificationSetting}
                        />
                    </View>
                    <TouchableOpacity
                        style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md flex-row justify-center items-center`}
                        onPress={() => handleSaveName(username, notificationSetting, chatNotificationSetting, setStoredName)}
                    >
                        <Icon name="save" size={20} color="white" />
                        <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Spara Namn</Text>
                    </TouchableOpacity>
                </>
            )}
            {team ? (
                <View style={tw`mt-3 w-full items-center`}>
                    <TouchableOpacity
                        style={tw`bg-green-500 p-2 rounded-lg shadow-md w-full max-w-md flex-row justify-center items-center mb-3`}
                        onPress={() => navigation.navigate("MapScreen")}
                    >
                        <Icon name="map" size={20} color="white" />
                        <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Visa Karta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={tw`bg-green-500 p-2 rounded-lg shadow-md w-full max-w-md flex-row justify-center items-center`}
                        onPress={() => navigation.navigate("TeamScreen")}
                    >
                        <Icon name="group" size={20} color="white" />
                        <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Hantera teamet</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={tw`mt-3`}>
                    <Text style={tw`text-base mb-4`}>Gå med i ett team för att kunna se kartan. Du kan också skapa ett team om du inte har något att gå med i.</Text>
                    <TouchableOpacity
                        style={tw`bg-green-500 p-2 rounded-lg shadow-md flex-row justify-center items-center`}
                        onPress={() => navigation.navigate("TeamScreen")}
                    >
                        <Icon name="group-add" size={20} color="white" />
                        <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Skapa team</Text>
                    </TouchableOpacity>
                </View>
            )}
            <TouchableOpacity
                style={tw`bg-red-500 p-2 rounded-lg shadow-md w-full max-w-md mt-3 flex-row justify-center items-center`}
                onPress={() => handleResetApp(setStoredName, setUsername, setUserId, setTeam, setTeamName)}
            >
                <Icon name="restart-alt" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Reset App, ta bort användare och börja om.</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={tw`bg-blue-500 p-2 rounded-lg shadow-md w-full max-w-md mt-3 flex-row justify-center items-center`}
                onPress={() => setAboutVisible(true)}
            >
                <Icon name="info" size={20} color="white" />
                <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Om TeamRadar</Text>
            </TouchableOpacity>

            <Modal
                visible={termsVisible}
                animationType="slide"
                onRequestClose={() => setTermsVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-gray-100 p-6`}>
                    <ScrollView style={tw`w-full max-w-md`}>
                        <Text style={tw`text-sm`}>{termsText}</Text>
                    </ScrollView>
                    <Button title="Stäng" onPress={() => setTermsVisible(false)} />
                </View>
            </Modal>

            <Modal
                visible={aboutVisible}
                animationType="slide"
                onRequestClose={() => setAboutVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-gray-100`}>
                    <Image
                        source={require('../../assets/splash.png')}
                        style={tw`w-full h-full`}
                        resizeMode="contain"
                    />
                    <TouchableOpacity
                        style={tw`bg-blue-500 p-2 rounded-lg shadow-md flex-row justify-center items-center mt-4`}
                        onPress={() => setAboutVisible(false)}
                    >
                        <Icon name="close" size={20} color="white" />
                        <Text style={tw`text-white text-center text-sm font-semibold ml-2`}>Stäng</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default UsernameScreen;
