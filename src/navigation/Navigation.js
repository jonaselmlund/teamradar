import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import UsernameScreen from '../screens/UsernameScreen';
import TeamScreen from '../screens/TeamScreen';
import ChatScreen from '../screens/ChatScreen';
import MapScreen from '../screens/MapScreen';
import TeamSettingsScreen from '../screens/TeamSettingsScreen';
import ExtraFunctionsScreen from '../screens/ExtraFunctionsScreen'; // Add this import

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="UsernameScreen">
        <Stack.Screen name="UsernameScreen" component={UsernameScreen} />
        <Stack.Screen name="TeamScreen" component={TeamScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="TeamSettingsScreen" component={TeamSettingsScreen} />
        <Stack.Screen name="ExtraFunctionsScreen" component={ExtraFunctionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
