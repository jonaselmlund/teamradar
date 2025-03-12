import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation hook
import { firebase } from '../firebaseConfig'; // Import Firebase configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebaseConfig';  // Justera till rätt sökväg
import uuid from 'react-native-uuid';
import { collection, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Camera } from 'expo-camera';

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

    useEffect(() => {
        const fetchUsernameFromFirestore = async () => {
            try {
                const storedUserId = await AsyncStorage.getItem('userId'); // Hämta userId från local storage
                
                if (!storedUserId) {
                    console.log('Ingen userId hittad i local storage');
                    return;
                }

                const userRef = doc(db, 'users', storedUserId);  // Korrigera här
                const docSnap = await getDoc(userRef);  // Korrigera här

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
            // Kolla om ett userId redan finns i local storage
            let storedUserId = await AsyncStorage.getItem('userId');
    
            if (!storedUserId) {
                // Generera ett nytt unikt ID om inget finns
                storedUserId = uuid.v4().toString();
                await AsyncStorage.setItem('userId', storedUserId);
                console.log('Genererade nytt userId:', storedUserId);
            }
    
            // Spara användaruppgifterna i Firestore under det genererade userId
            const userRef = doc(db, 'users', storedUserId);  // Korrigera här
            await setDoc(userRef, {
                username,
                notificationSetting,
                chatNotificationSetting
            });
    
            // Uppdatera UI
            setStoredName(username);
            console.log(`Sparade till Firestore: User ID: ${storedUserId}, Username: ${username}`);
        } catch (error) {
            console.error('Fel vid sparande av namn:', error);
        }
    };

    const handleResetApp = async () => {
        try {
            // Hämta userId från Local Storage
            const storedUserId = await AsyncStorage.getItem('userId');
    
            if (!storedUserId) {
                console.log('Ingen användare att radera.');
                return;
            }
    
            // Ta bort användaren från Firestore
            const userRef = doc(db, 'users', storedUserId);  // Korrigera här
            await deleteDoc(userRef);  // Korrigera här
            console.log(`Användare ${storedUserId} raderad från Firestore.`);
    
            // Rensa Local Storage
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.clear();
    
            // Uppdatera UI
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
            } else {
                alert("Team-koden är ogiltig!");
            }
        } catch (error) {
            console.error("Fel vid anslutning till team:", error);
        }
    };

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanning(false);
        try {
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
            } else {
                alert("Team-koden är ogiltig!");
            }
        } catch (error) {
            console.error("Fel vid anslutning till team:", error);
        }
    };
    
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
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
                        <Text style={tw`text-lg mb-4`}>Du är med i team: {teamName}</Text>
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
