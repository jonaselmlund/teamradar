import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { collection, getDocs, updateDoc, doc, getDoc, query, where } from 'firebase/firestore';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { fetchMembers } from '../utils/teamUtils';

const MapScreen = () => {
    const [users, setUsers] = useState([]);
    const [currentUserLocation, setCurrentUserLocation] = useState(null);
    const [gatheringPoint, setGatheringPoint] = useState(null);
    const [members, setMembers] = useState([]);
    const [mapType, setMapType] = useState('standard');
    const navigation = useNavigation();
    const route = useRoute();
    const { member } = route.params || {};

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return;

                // Fetch the current user's team ID
                const userRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userRef);
                if (!userDoc.exists() || !userDoc.data().teamId) {
                    console.log('User is not part of a team.');
                    return;
                }

                const teamId = userDoc.data().teamId;

                // Fetch users who are part of the same team
                const teamUsersQuery = query(
                    collection(db, 'users'),
                    where('teamId', '==', teamId)
                );
                const querySnapshot = await getDocs(teamUsersQuery);
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                console.log('Fetched Team Users:', usersData);

                // Filter users with valid coordinates
                const validUsers = usersData.filter(user =>
                    user.trackingState !== false && // Exclude users with tracking disabled
                    user.latitude !== undefined &&
                    user.longitude !== undefined &&
                    !isNaN(user.latitude) &&
                    !isNaN(user.longitude)
                );
                setUsers(validUsers);
            } catch (error) {
                console.error('Error fetching team users:', error);
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

                // Fetch gathering point if exists
                const userDoc = await getDoc(userRef);
                if (userDoc.exists() && userDoc.data().teamId) {
                    const teamRef = doc(db, 'teams', userDoc.data().teamId);
                    const teamDoc = await getDoc(teamRef);
                    if (teamDoc.exists() && teamDoc.data().gatheringPoint) {
                        setGatheringPoint(teamDoc.data().gatheringPoint);
                    }
                }
            }
        })();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const teamId = member?.teamId;
            if (teamId) {
                const membersData = await fetchMembers(teamId);
                const filteredMembers = membersData.filter(m => m.isTracking !== false);
                setMembers(filteredMembers);
            }
        };
        fetchData();
    }, [member]);

    const handleLongPress = async (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists() && userDoc.data().teamId) {
            const teamId = userDoc.data().teamId;
            Alert.alert(
                "Ange samlingsplats",
                "Vill du använda denna plats som samlingsplats?",
                [
                    {
                        text: "Avbryt",
                        style: "cancel"
                    },
                    {
                        text: "Ja",
                        onPress: async () => {
                            const teamRef = doc(db, 'teams', teamId);
                            await updateDoc(teamRef, {
                                gatheringPoint: { latitude, longitude }
                            });
                            setGatheringPoint({ latitude, longitude });
                            Alert.alert("Samlingsplats markerad!");
                        }
                    }
                ]
            );
        }
    };

    const handleGatheringPointPress = async () => {
        Alert.alert(
            "Samlingsplats",
            "Vad vill du göra?",
            [
                {
                    text: "Ta bort",
                    onPress: async () => {
                        const userId = await AsyncStorage.getItem('userId');
                        if (!userId) return;

                        const userRef = doc(db, 'users', userId);
                        const userDoc = await getDoc(userRef);
                        if (userDoc.exists() && userDoc.data().teamId) {
                            const teamId = userDoc.data().teamId;
                            const teamRef = doc(db, 'teams', teamId);
                            await updateDoc(teamRef, {
                                gatheringPoint: null
                            });
                            setGatheringPoint(null);
                            Alert.alert("Samlingsplats borttagen!");
                        }
                    }
                },
                {
                    text: "Samlas nu!",
                    onPress: async () => {
                        const userId = await AsyncStorage.getItem('userId');
                        if (!userId) return;

                        const userRef = doc(db, 'users', userId);
                        const userDoc = await getDoc(userRef);
                        if (userDoc.exists() && userDoc.data().teamId) {
                            const teamId = userDoc.data().teamId;

                            // Fetch team members with notifications enabled
                            const membersQuery = query(collection(db, 'users'), where('teamId', '==', teamId), where('notificationSetting', '==', true));
                            const membersSnapshot = await getDocs(membersQuery);
                            const members = membersSnapshot.docs.map(doc => doc.data());

                            // Send notifications to team members
                            members.forEach(member => {
                                if (member.pushToken) {
                                    Notifications.scheduleNotificationAsync({
                                        content: {
                                            title: "Dags att samlas",
                                            body: "Nu är det samling för teamet. Se på kartan var vi ska träffas.",
                                        },
                                        trigger: null,
                                    });
                                }
                            });

                            Alert.alert("Samlingsmeddelande utskickat!");
                        }
                    }
                },
                {
                    text: "Avbryt",
                    style: "cancel"
                }
            ]
        );
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371000; // Radius of the Earth in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            0.5 - Math.cos(dLat)/2 + 
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            (1 - Math.cos(dLon))/2;

        return R * 2 * Math.asin(Math.sqrt(a));
    };

    const handleUserMarkerPress = (user) => {
        if (currentUserLocation) {
            const distance = calculateDistance(
                currentUserLocation.latitude,
                currentUserLocation.longitude,
                user.latitude,
                user.longitude
            );

            // Format the timestamp if it exists
            const lastUpdated = user.timestamp
                ? new Date(user.timestamp).toLocaleString()
                : 'N/A';

            Alert.alert(
                user.username,
                `Avstånd: ${distance.toFixed(0)} meter\nSenast uppdaterad: ${lastUpdated}`,
                [{ text: "Stäng" }]
            );
        } else {
            Alert.alert(
                user.username,
                "Avstånd: N/A\nSenast uppdaterad: N/A",
                [{ text: "Stäng" }]
            );
        }
    };

    const toggleMapType = () => {
        setMapType((prevMapType) => (prevMapType === 'standard' ? 'satellite' : 'standard'));
    };

    return (
        <View style={styles.container}>
            <MapView
                provider="google"
                style={styles.map}
                mapType={mapType}
                initialRegion={{
                    latitude: 59.326242,
                    longitude: 18.071665,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                onLongPress={handleLongPress}
            >
                {users.map((user, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: user.latitude, longitude: user.longitude }}
                        title={user.username}
                        onPress={() => handleUserMarkerPress(user)}
                    >
                        <View style={styles.marker}>
                            <Text style={styles.markerText}>{user.username.slice(0, 2)}</Text>
                        </View>
                    </Marker>
                ))}
                {gatheringPoint && (
                    <Marker
                        coordinate={gatheringPoint}
                        pinColor="red"
                        onPress={handleGatheringPointPress}
                    >
                        <View style={styles.marker}>
                            <Text style={styles.markerText}>GP</Text>
                        </View>
                    </Marker>
                )}
                {members.map((member) => (
                    <Marker
                        key={member.id}
                        coordinate={{ latitude: member.latitude, longitude: member.longitude }}
                        title={member.username}
                    />
                ))}
            </MapView>
            <View style={styles.buttonContainer}>
                <Button title="Tillbaka" onPress={() => navigation.goBack()} />
                <Button title="Chat" onPress={() => navigation.navigate("ChatScreen")} />
                <Button title="Byt karttyp" onPress={toggleMapType} />
            </View>
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
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 10,
        right: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});

export default MapScreen;
