import React from 'react';
import { View, Text } from 'react-native';
import tw from 'twrnc';

const UserSettingsScreen = () => {
    return (
        <View style={tw`flex-1 p-4 bg-gray-100`}>
            <Text style={tw`text-lg mb-4 text-center`}>User Settings</Text>
            {/* Add your user settings UI here */}
        </View>
    );
};

export default UserSettingsScreen;