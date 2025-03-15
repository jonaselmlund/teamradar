import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import { firebase } from '../firebaseConfig'; // Import Firebase configuration
import { collection, addDoc, getDocs, getDoc, doc, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';  // Adjust to correct path
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Timestamp } from 'firebase/firestore';

const ChatScreen = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [teamId, setTeamId] = useState(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                setTeamId(userDoc.data().teamId);
                setUsername(userDoc.data().username);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (!teamId) return;

        const q = query(collection(db, 'messages'), where('teamId', '==', teamId));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messagesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(messagesData);
        });

        return () => unsubscribe();
    }, [teamId]);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        try {
            const newMessage = {
                text: message,
                username,
                teamId,
                timestamp: Timestamp.fromDate(new Date()), 
            };
            await addDoc(collection(db, 'messages'), newMessage);

            setMessage('');

            // Fetch team members with chat notifications enabled
            const membersQuery = query(collection(db, 'users'), where('teamId', '==', teamId), where('chatNotificationSetting', '==', true));
            const membersSnapshot = await getDocs(membersQuery);
            const members = membersSnapshot.docs.map(doc => doc.data());

            // Send notifications to team members
            members.forEach(member => {
                if (member.pushToken) {
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: `New message from ${username}`,
                            body: message,
                        },
                        trigger: null,
                    });
                }
            });
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <View style={styles.messageContainer}>
                        <View style={styles.usernameRow}>
                            <Text style={styles.username}>{item.username}</Text>
                            <Text style={styles.timestamp}>{item.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                        <Text style={styles.message}>{item.text}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.id}
            />
            <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message"
            />
            <Button title="Send" onPress={handleSendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 10,
    },
    usernameRow: {
        flexDirection: 'row',  // Gör att username och timestamp ligger bredvid varandra
        justifyContent: 'space-between',  // Sprider ut texten på samma rad
        alignItems: 'center',  // Centrerar dem vertikalt
    },
    timestamp: {
        fontSize: 12,
        color: 'gray',
        marginLeft: 10, // Skapa lite utrymme mellan username och tid
    },
    messageContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
    username: {
        fontWeight: 'bold',
    },
    message: {
        paddingTop: 5,
    },
});

export default ChatScreen;
