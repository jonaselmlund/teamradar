import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UsernameScreen from './screens/usernameScreen';
import TeamScreen from './screens/TeamScreen';
import MapScreen from './screens/mapScreen';  // Import MapScreen
import ChatScreen from './screens/chatScreen';  // Import ChatScreen

const Stack = createStackNavigator();

const App = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="UsernameScreen">
                <Stack.Screen name="UsernameScreen" component={UsernameScreen} />
                <Stack.Screen name="TeamScreen" component={TeamScreen} />
                <Stack.Screen name="MapScreen" component={MapScreen} />  {/* Add MapScreen to navigator */}
                <Stack.Screen name="ChatScreen" component={ChatScreen} />  {/* Add ChatScreen to navigator */}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
