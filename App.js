import React from 'react';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Välkommen!</Text>
      <Text>Eftersom det är första gången du öppnar Teamradar behöver du ange ditt namn.</Text>
    </View>
  );
}
