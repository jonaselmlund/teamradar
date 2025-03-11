import React from 'react';
import { SafeAreaView } from 'react-native';
import Navigation from './navigation/Navigation'; // Importera din Navigation-komponent

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
           <Navigation />  {/* Render the Navigation component */}
        </SafeAreaView>
  );
}
