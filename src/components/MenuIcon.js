import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'twrnc';

const MenuIcon = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    const menuItems = [
        { name: 'Hem', screen: 'UsernameScreen' },
        { name: 'Teaminställningar', screen: 'TeamSettingsScreen' },
        { name: 'Användarinställningar', screen: 'UserSettingsScreen' },
        { name: 'Extra funktioner', screen: 'ExtraFunctionsScreen' },
        { name: 'Chat', screen: 'ChatScreen' },
        { name: 'Karta', screen: 'MapScreen' },
    ];

    return (
        <View>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={tw`p-2`}>
                <Icon name="menu" size={30} color="black" />
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                    <View style={tw`bg-white p-4 rounded-lg w-3/4`}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={tw`p-2 border-b border-gray-200`}
                                onPress={() => {
                                    setModalVisible(false);
                                    navigation.navigate(item.screen);
                                }}
                            >
                                <Text style={tw`text-lg`}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={tw`p-2 mt-4 bg-red-500 rounded-lg`}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={tw`text-white text-center`}>Stäng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default MenuIcon;