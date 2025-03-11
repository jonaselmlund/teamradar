import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import UsernameScreen from '../screens/UsernameScreen'; // Den första skärmen
import TeamScreen from '../screens/TeamScreen';

const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="UsernameScreen">
        <Stack.Screen name="UsernameScreen" component={UsernameScreen} />
        <Stack.Screen name="TeamScreen" component={TeamScreen} />
       
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
