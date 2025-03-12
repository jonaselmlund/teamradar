import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UsernameScreen from './screens/UsernameScreen';
import TeamScreen from './screens/TeamScreen';// Correct capitalization
import ChatScreen from './screens/ChatScreen';  // Correct capitalization   
import MapScreen from './screens/MapScreen';  // Correct capitalization


const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="UsernameScreen">
                <Stack.Screen name="UsernameScreen" component={UsernameScreen} />
                <Stack.Screen name="TeamScreen" component={TeamScreen} />
                <Stack.Screen name="MapScreen" component={MapScreen} /> 
                <Stack.Screen name="ChatScreen" component={ChatScreen} /> 
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
