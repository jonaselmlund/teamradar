import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import { firebase } from '../firebaseConfig'; // Import Firebase configuration
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';  // Adjust to correct path
import { useNavigation } from '@react-navigation/native';

const ChatScreen = () => {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'messages'));
                const messagesData = querySnapshot.docs.map(doc => doc.data());
                setMessages(messagesData);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, []);

    const handleSendMessage = async () => {
        try {
            await addDoc(collection(db, 'messages'), { text: message });
            setMessage('');
            // Fetch messages again to update the list
            const querySnapshot = await getDocs(collection(db, 'messages'));
            const messagesData = querySnapshot.docs.map(doc => doc.data());
            setMessages(messagesData);
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={({ item }) => <Text style={styles.message}>{item.text}</Text>}
                keyExtractor={(item, index) => index.toString()}
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
    message: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
});

export default ChatScreen;
