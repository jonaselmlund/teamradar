import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Picker } from "@react-native-picker/picker";
import { fetchUsernameFromFirestore, handleSaveName, handleResetApp, handleJoinTeamWithCode, handleBarCodeScanned } from '../utils/handleName';

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
    const navigation = useNavigation();
    const [updateFrequency, setUpdateFrequency] = useState(60000); // Default to 1 minute
    const [isTracking, setIsTracking] = useState(true);

    useEffect(() => {
        fetchUsernameFromFirestore(setStoredName, setTeam, setTeamName);
    }, []);

    const startTrackingPosition = async () => {
        const updatePosition = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const currentHour = new Date().getHours();

            if (currentHour >= inactiveHoursStart || currentHour < inactiveHoursEnd) {
                console.log('Inactive hours, not updating position.');
                return;
            }

            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const userRef = doc(db, 'users', userId);
                await updateDoc(userRef, {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            }
        };

        setInterval(updatePosition, updateFrequency);
    };

    const toggleTracking = () => {
        setIsTracking(!isTracking);
        if (isTracking) {
            clearInterval(startTrackingPosition);
        } else {
            startTrackingPosition();
        }
    };

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
        console.log('Scanning QR code...');
        return (
            <Camera
                onBarCodeScanned={(data) => handleBarCodeScanned(data, userId, setTeam, setTeamName, startTrackingPosition)}
                style={StyleSheet.absoluteFillObject}
            />
        );
    }

    return (
        <View style={tw`flex-1 justify-center items-center bg-gray-100 p-6`}>
            {storedName ? (
                <>
                    <Text style={tw`text-xl mb-4`}>Välkommen, {storedName || "Gäst" }</Text>
                    {team ? (
                        <>
                            <Text style={tw`text-lg mb-4`}>Du är med i team: {teamName}</Text>
                            <Text style={tw`text-lg mb-4`}>Hur ofta vill du att din position ska uppdateras?</Text>
                            <Picker
                                selectedValue={updateFrequency}
                                style={tw`w-full max-w-md mb-4`}
                                onValueChange={(itemValue) => setUpdateFrequency(itemValue)}
                            >
                                <Picker.Item label="var 10:e sekund, bästa prestanda" value={10000} />
                                <Picker.Item label="varje minut" value={60000} />
                                <Picker.Item label="Var 3:e minut" value={180000} />
                                <Picker.Item label="var 10:e minut, sparar batteri" value={600000} />
                            </Picker>
                            <Text style={tw`text-lg mb-4`}>Just nu är din position {isTracking ? "synlig" : "osynlig"}</Text>

                            <Button title={isTracking ? "Visa mig inte på kartan." : "jag vill vara synlig på kartan"} onPress={toggleTracking} />
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={tw`bg-blue-500 p-4 rounded-lg shadow-md w-full max-w-md mb-4`}
                                onPress={() => setScanning(true)}
                            >
                                <Text style={tw`text-white text-center text-lg font-semibold`}>Gå med i team via QR-kod</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={tw`border border-gray-400 rounded-lg p-4 mb-4 w-full max-w-md`}
                                placeholder="Ange team-kod"
                                value={teamCodeInput}
                                onChangeText={setTeamCodeInput}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity
                                style={tw`bg-blue-500 p-4 rounded-lg shadow-md w-full max-w-md`}
                                onPress={() => handleJoinTeamWithCode(teamCodeInput, userId, setTeam, setTeamName, startTrackingPosition)}
                            >
                                <Text style={tw`text-white text-center text-lg font-semibold`}>Gå med i team med kod</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </>
            ) : (
                <>
                    <Text style={tw`text-xl mb-4`}>Inget namn sparat än.</Text>
                    <TextInput
                        style={tw`border border-gray-400 rounded-lg p-4 mb-4 w-full max-w-md`}
                        placeholder="Ange ditt namn"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <View style={tw`flex-row justify-between items-center mb-4 w-full max-w-md`}>
                        <Text style={tw`text-lg`}>Allmäna notifieringar på?</Text>
                        <Switch
                            value={notificationSetting}
                            onValueChange={setNotificationSetting}
                        />
                    </View>
                    <View style={tw`flex-row justify-between items-center mb-4 w-full max-w-md`}>
                        <Text style={tw`text-lg`}>Notifieringar från chat på?</Text>
                        <Switch
                            value={chatNotificationSetting}
                            onValueChange={setChatNotificationSetting}
                        />
                    </View>
                    <TouchableOpacity
                        style={tw`bg-blue-500 p-4 rounded-lg shadow-md w-full max-w-md`}
                        onPress={() => handleSaveName(username, notificationSetting, chatNotificationSetting, setStoredName)}
                    >
                        <Text style={tw`text-white text-center text-lg font-semibold`}>Spara Namn</Text>
                    </TouchableOpacity>
                </>
            )}
            
            <Button title="Hantera eller skapa team" onPress={() => navigation.navigate("TeamScreen")} />

            <Button title="Visa Karta" onPress={() => navigation.navigate("MapScreen")} /> 
            
            <TouchableOpacity
                style={tw`bg-red-500 p-4 rounded-lg shadow-md w-full max-w-md mt-4`}
                onPress={() => handleResetApp(setStoredName, setUsername, setUserId, setTeam, setTeamName)}
            >
                <Text style={tw`text-white text-center text-lg font-semibold`}>Reset App, ta bort användare och börja om.</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        width: '80%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        borderRadius: 5,
    },
});

export default UsernameScreen;
