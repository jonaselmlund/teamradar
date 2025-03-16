import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UsernameScreen from './screens/UsernameScreen';
import TeamScreen from './screens/TeamScreen';
import ChatScreen from './screens/ChatScreen';
import MapScreen from './screens/MapScreen';
import TeamSettingsScreen from './screens/TeamSettingsScreen';
import ExtraFunctionsScreen from './screens/ExtraFunctionsScreen';

const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="UsernameScreen">
                <Stack.Screen name="UsernameScreen" component={UsernameScreen} />
                <Stack.Screen name="TeamScreen" component={TeamScreen} />
                <Stack.Screen name="MapScreen" component={MapScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name="TeamSettingsScreen" component={TeamSettingsScreen} />
                <Stack.Screen name="ExtraFunctionsScreen" component={ExtraFunctionsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
