import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import { TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';  // Import useNavigation hook
import { firebase } from '../firebaseConfig'; // Import Firebase configuration
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebaseConfig';  // Justera till rätt sökväg
import { v4 as uuidv4 } from 'uuid'; // Importera UUID-generator
import uuid from 'react-native-uuid';
import { collection, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';


const UsernameScreen = () => {
    const [username, setUsername] = useState('');
    const [storedName, setStoredName] = useState(null);
    const [userId, setUserId] = useState(null);
    const [notificationSetting, setNotificationSetting] = useState(false);
    const [chatNotificationSetting, setChatNotificationSetting] = useState(false);
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
                storedUserId = uuid.v4();
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
    
            console.log('Local Storage rensat.');
        } catch (error) {
            console.error('Fel vid reset av app:', error);
        }
    };

    return (
        <View style={tw`flex-1 justify-center items-center bg-gray-100 p-6`}>
            {storedName ? (
                <Text style={tw`text-xl mb-4`}>Välkommen tillbaka, {storedName}!</Text>
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
                        <Text style={tw`text-lg`}>Notification Setting</Text>
                        <Switch
                            value={notificationSetting}
                            onValueChange={setNotificationSetting}
                        />
                    </View>
                    <View style={tw`flex-row justify-between items-center mb-4 w-full max-w-md`}>
                        <Text style={tw`text-lg`}>Chat Notification Setting</Text>
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
            
            <Button title="Hantera Team" onPress={() => navigation.navigate("TeamScreen")} />
            <Button title="Visa Karta" onPress={() => navigation.navigate("MapScreen")} />  {/* New button to navigate to MapScreen */}
            
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
