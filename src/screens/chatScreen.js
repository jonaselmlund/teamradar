import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import { firebase } from '../firebaseConfig'; // Import Firebase configuration
import { collection, addDoc, getDocs, getDoc, doc, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';  // Adjust to correct path
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Timestamp } from 'firebase/firestore';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
        <View style={tw`flex-1 p-4 bg-gray-100`}>
            <FlatList
                data={messages}
                renderItem={({ item }) => (
                    <View style={tw`p-2 mb-1 bg-gray-200 rounded-lg shadow`}>
                        <View style={tw`flex-row justify-between items-center`}>
                            <Text style={tw`font-bold text-xs`}>{item.username}</Text>
                            <Text style={tw`text-gray-500 text-xs ml-2`}>{item.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                        <Text style={tw`pt-1 text-gray-800 text-sm`}>{item.text}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.id}
                style={tw`mb-4`}
            />
            <View style={tw`flex-row items-center`}>
                <TextInput
                    style={tw`flex-1 h-10 border border-gray-400 rounded-lg p-2 bg-white`}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message"
                />
                <TouchableOpacity onPress={handleSendMessage} style={tw`ml-2`}>
                    <Icon name="send" size={28} color="#4CAF50" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ChatScreen;
