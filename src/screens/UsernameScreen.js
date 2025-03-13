import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, TouchableOpacity, Picker } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebaseConfig';
import uuid from 'react-native-uuid';
import { collection, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';

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
        const fetchUsernameFromFirestore = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                
                if (!storedUserId) {
                    console.log('Ingen userId hittad i local storage');
                    return;
                }

                const userRef = doc(db, 'users', storedUserId);
                const docSnap = await getDoc(userRef);

                if (docSnap.exists()) {
                    setStoredName(docSnap.data().username);
                    const teamId = docSnap.data().teamId ? docSnap.data().teamId : null;
                    setTeam(teamId);
                    if (teamId) {
                        const teamRef = doc(db, 'teams', teamId);
                        const teamSnap = await getDoc(teamRef);
                        if (teamSnap.exists()) {
                            setTeamName(teamSnap.data().name);
                        }
                    }
                    console.log('Hämtat namn från Firestore:', docSnap.data().username);
                } else {
                    console.log('Inget användarnamn hittat i Firestore');
                }
            } catch (error) {
                console.error('Fel vid hämtning av användarnamn:', error);
            }
        };
    
        fetchUsernameFromFirestore();
    }, []);

    const handleSaveName = async () => {
        try {
            let storedUserId = await AsyncStorage.getItem('userId');
    
            if (!storedUserId) {
                storedUserId = uuid.v4().toString();
                await AsyncStorage.setItem('userId', storedUserId);
                console.log('Genererade nytt userId:', storedUserId);
            }
    
            const userRef = doc(db, 'users', storedUserId);
            await setDoc(userRef, {
                username,
                notificationSetting,
                chatNotificationSetting
            });
    
            setStoredName(username);
            console.log(`Sparade till Firestore: User ID: ${storedUserId}, Username: ${username}`);
        } catch (error) {
            console.error('Fel vid sparande av namn:', error);
        }
    };

    const handleResetApp = async () => {
        try {
            const storedUserId = await AsyncStorage.getItem('userId');
    
            if (!storedUserId) {
                console.log('Ingen användare att radera.');
                return;
            }
    
            const userRef = doc(db, 'users', storedUserId);
            await deleteDoc(userRef);
            console.log(`Användare ${storedUserId raderad från Firestore.`);
    
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.clear();
    
            setStoredName(null);
            setUsername('');
            setUserId(null);
            setTeam(null);
            setTeamName('');
    
            console.log('Local Storage rensat.');
        } catch (error) {
            console.error('Fel vid reset av app:', error);
        }
    };

    const handleJoinTeamWithCode = async () => {
        if (!teamCodeInput.trim()) {
            alert("Ange en team-kod!");
            return;
        }

        try {
            const teamDoc = await getDoc(doc(db, "teams", teamCodeInput));
            if (teamDoc.exists()) {
                await updateDoc(doc(db, "users", userId), {
                    teamId: teamCodeInput,
                    isAdmin: false
                });

                alert("Gick med i teamet!");
                setTeam(teamCodeInput);
                setTeamName(teamDoc.data().name);
                startTrackingPosition();
            } else {
                alert("Team-koden är ogiltig!");
            }
        } catch (error) {
            console.error("Fel vid anslutning till team:", error);
        }
    };

    const handleBarCodeScanned = async ({ type, data }) => {
        console.log(`PLACE !`);
        setScanning(false);
        try {
            console.log(`Scanned barcode of type ${type} with data: ${data}`);
            const teamDoc = await getDoc(doc(db, "teams", data));
            if (teamDoc.exists()) {
                if (!userId) {
                    alert("Användar-ID saknas. Kan inte gå med i teamet.");
                    return;
                }
                await updateDoc(doc(db, "users", userId), {
                    teamId: data,
                    isAdmin: false
                });
                alert("Gick med i teamet!");
                setTeam(data);
                setTeamName(teamDoc.data().name);
                startTrackingPosition();
            } else {
                alert("Team-koden är ogiltig!");
            }
        } catch (error) {
            console.error("Fel vid anslutning till team:", error);
            alert("Något gick fel vid anslutning till teamet.");
        }
    };

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
                onBarCodeScanned={handleBarCodeScanned}
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
                            <Picker
                                selectedValue={updateFrequency}
                                style={tw`w-full max-w-md mb-4`}
                                onValueChange={(itemValue) => setUpdateFrequency(itemValue)}
                            >
                                <Picker.Item label="10 sekunder" value={10000} />
                                <Picker.Item label="1 minut" value={60000} />
                                <Picker.Item label="3 minuter" value={180000} />
                                <Picker.Item label="10 minuter" value={600000} />
                            </Picker>
                            <Button title={isTracking ? "Göm mig" : "Visa mig"} onPress={toggleTracking} />
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
                                onPress={handleJoinTeamWithCode}
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
                        onPress={handleSaveName}
                    >
                        <Text style={tw`text-white text-center text-lg font-semibold`}>Spara Namn</Text>
                    </TouchableOpacity>
                </>
            )}
            
            <Button title="Hantera eller skapa team" onPress={() => navigation.navigate("TeamScreen")} />

            <Button title="Visa Karta" onPress={() => navigation.navigate("MapScreen")} /> 
            
            <TouchableOpacity
                style={tw`bg-red-500 p-4 rounded-lg shadow-md w-full max-w-md mt-4`}
                onPress={handleResetApp}
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
