import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TeamSettingsScreen from '../screens/TeamSettingsScreen';
import ChatScreen from '../screens/ChatScreen';
import MapScreen from '../screens/MapScreen';
import TeamScreen from '../screens/TeamScreen';
import UsernameScreen from '../screens/UsernameScreen';
import ExtraFunctionsScreen from '../screens/ExtraFunctionsScreen';
import UserSettingsScreen from '../screens/UserSettingsScreen'; // Add this import

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="UsernameScreen">
            <Stack.Screen name="UsernameScreen" component={UsernameScreen} />
            <Stack.Screen name="TeamSettingsScreen" component={TeamSettingsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
            <Stack.Screen name="Team" component={TeamScreen} />
            <Stack.Screen name="ExtraFunctionsScreen" component={ExtraFunctionsScreen} />
            <Stack.Screen name="UserSettings" component={UserSettingsScreen} />
        </Stack.Navigator>
    );
};

export default AppNavigator;