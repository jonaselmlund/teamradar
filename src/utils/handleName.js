import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveNameToLocalStorage = async (name) => {
  try {
    if (name.trim() !== '') {
      await AsyncStorage.setItem('username', name);
      console.log('Namn sparat:', name);
    } else {
      console.log('Vänligen ange ett namn.');
    }
  } catch (error) {
    console.error('Fel vid sparande av namn:', error);
  }
}

 export const getNameFromLocalStorage = async () => {
    try {
      const storedName = await AsyncStorage.getItem('username');
      if (storedName) {
        console.log('Hämtat sparat namn:', storedName);
        return storedName;  // Returera det sparade namnet
      } else {
        console.log('Inget namn sparat');
      }
    } catch (error) {
      console.error('Fel vid hämtning av namn:', error);
    }
};
