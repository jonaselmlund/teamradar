import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import UsernameScreen from '../screens/UsernameScreen';
import TeamScreen from '../screens/TeamScreen';
import ChatScreen from '../screens/ChatScreen'; // Correct capitalization
import MapScreen from '../screens/MapScreen'; // Correct capitalization

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="UsernameScreen">
        <Stack.Screen name="UsernameScreen" component={UsernameScreen} />
        <Stack.Screen name="TeamScreen" component={TeamScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />  {/* Correct capitalization */}
        <Stack.Screen name="MapScreen" component={MapScreen} />  {/* Correct capitalization */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
