import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';  // Adjust to correct path
import { collection, getDocs } from 'firebase/firestore';

const MapScreen = () => {
    const [users, setUsers] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersData = querySnapshot.docs.map(doc => doc.data());

                console.log("Fetched Users:", usersData);

                const validUsers = usersData.filter(user => 
                    user.latitude !== undefined &&
                    user.longitude !== undefined &&
                    !isNaN(user.latitude) &&
                    !isNaN(user.longitude)
                );
                setUsers(validUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <View style={styles.container}>
            <MapView
                provider="google"
                style={styles.map}
                initialRegion={{
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {users.map((user, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: user.latitude, longitude: user.longitude }}
                        title={user.username}
                    />
                ))}
            </MapView>
            <Button title="Back" onPress={() => navigation.goBack()} />
            <Button title="Chat" onPress={() => navigation.navigate("ChatScreen")} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default MapScreen;
