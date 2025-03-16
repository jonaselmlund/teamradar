import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";

const App = () => {
  const [inputs, setInputs] = useState({ name: "", email: "", message: "" });
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    if (inputs.name && inputs.email && inputs.message) {
      setItems([...items, { id: Date.now().toString(), ...inputs }]);
      setInputs({ name: "", email: "", message: "" });
    }
  };

  return (
    <View className="flex-1 p-4 bg-blue-50">
      <Text className="text-2xl font-bold text-blue-700 mb-4">React Native Form</Text>
      
      <TextInput
        className="border border-green-500 p-2 rounded-lg mb-2 bg-white"
        placeholder="Name"
        value={inputs.name}
        onChangeText={(text) => setInputs({ ...inputs, name: text })}
      />
      <TextInput
        className="border border-green-500 p-2 rounded-lg mb-2 bg-white"
        placeholder="Email"
        keyboardType="email-address"
        value={inputs.email}
        onChangeText={(text) => setInputs({ ...inputs, email: text })}
      />
      <TextInput
        className="border border-green-500 p-2 rounded-lg mb-2 bg-white"
        placeholder="Message"
        multiline
        numberOfLines={3}
        value={inputs.message}
        onChangeText={(text) => setInputs({ ...inputs, message: text })}
      />
      
      <TouchableOpacity className="bg-green-600 p-3 rounded-lg" onPress={handleAddItem}>
        <Text className="text-white text-center font-semibold">Add Item</Text>
      </TouchableOpacity>
      
      <Text className="text-xl font-semibold text-blue-600 mt-4">List of Items</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white border border-blue-400 rounded-lg p-3 mt-2">
            <Text className="text-blue-700 font-bold">{item.name}</Text>
            <Text className="text-green-700">{item.email}</Text>
            <Text className="text-gray-700 italic">{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default App;
