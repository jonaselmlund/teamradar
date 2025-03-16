import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UsernameScreen from './screens/UsernameScreen';
import TeamScreen from './screens/TeamScreen';
import ChatScreen from './screens/ChatScreen';
import MapScreen from './screens/MapScreen';
import TeamSettingsScreen from './screens/TeamSettingsScreen';
import ExtraFunctionsScreen from './screens/ExtraFunctionsScreen';
import { auth, signInAnonymously } from "./firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { View, ActivityIndicator } from 'react-native';

const Stack = createStackNavigator();

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
            } else {
                signInAnonymously(auth)
                    .then(() => {
                        setIsAuthenticated(true);
                    })
                    .catch((error) => {
                        console.error("Error signing in anonymously:", error);
                    });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="UsernameScreen">
                <Stack.Screen name="UsernameScreen" component={UsernameScreen} />
                <Stack.Screen name="TeamScreen" component={TeamScreen} />
                <Stack.Screen name="MapScreen" component={MapScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name="TeamSettingsScreen" component={TeamSettingsScreen} />
                <Stack.Screen name="ExtraFunctionsScreen" component={ExtraFunctionsScreen}/> 
                </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;