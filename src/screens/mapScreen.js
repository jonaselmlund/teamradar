import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert, Text } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import * as Location from 'expo-location';

const MapScreen = () => {
    const [users, setUsers] = useState([]);
    const [currentUserLocation, setCurrentUserLocation] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentUserLocation(location.coords);

            // Update user location in Firebase
            const userId = await AsyncStorage.getItem('userId');
            if (userId) {
                const userRef = doc(db, 'users', userId);
                console.log('Updating user location:', location.coords);

                await updateDoc(userRef, {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            }
        })();
    }, []);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            0.5 - Math.cos(dLat)/2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            (1 - Math.cos(dLon))/2;

        return R * 2 * Math.asin(Math.sqrt(a));
    };

    return (
        <View style={styles.container}>
            <MapView
                provider="google"
                style={styles.map}
                initialRegion={{
                    latitude: 59.326242,
                    longitude: 18.071665,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                {users.map((user, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: user.latitude, longitude: user.longitude }}
                        title={user.username}
                    >
                        <View style={styles.marker}>
                            <Text style={styles.markerText}>{user.username.slice(0, 2)}</Text>
                        </View>
                        <Callout onPress={() => {
                            if (currentUserLocation) {
                                const distance = calculateDistance(
                                    currentUserLocation.latitude,
                                    currentUserLocation.longitude,
                                    user.latitude,
                                    user.longitude
                                );
                                Alert.alert(
                                    `User: ${user.username}`,
                                    `Distance: ${distance.toFixed(2)} km`
                                );
                            } else {
                                Alert.alert(`User: ${user.username}`);
                            }
                        }}>
                            <Text>{user.username}</Text>
                        </Callout>
                    </Marker>
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
    marker: {
        backgroundColor: 'blue',
        padding: 5,
        borderRadius: 5,
    },
    markerText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default MapScreen;
