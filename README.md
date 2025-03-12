# teamradar

#GIT
git config --global user.name "jonaselmlund"
git config --global user.email "jonas.elmlund@gmail.com"

#hur man kör servern:
npx expo start 

#Info om react native-appen.
App.js är startsidan.

#Tailwind
npm install twrnc

#asynchstorage för att spara saker lokalt på telefonen
npm install @react-native-async-storage/async-storage

# uid  för unikt user id till local storage som identifierare av användare.
# fel: npm install uid
npm install react-native-uuid


# NAVIGATION
npm install @react-navigation/native
npm install @react-navigation/stack
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-screens react-native-safe-area-context

# FIREBASE
npm install firebase

Ändra alla förekomster av getFirestore(db) till bara db: Eftersom db redan är konfigurerat i din firebaseConfig.js-fil, behöver du inte anropa getFirestore igen.

# MAPS 
npm install react-native-maps
expo install expo-location

# TROUBLESHOOTING
 <Stack.Screen name="ChatScreen" component={ChatScreen} /> 
 man får inte ha någonting bakom, inte ens en kommentar skapad av openai
 
 # QR CODE PACKAGE
 npm install react-native-qrcode-svg

# Camera som barcode scanner
npx expo install expo-camera

#PROMPTS: teamChat:
please help me to: 1. remove the skapa team buttom when a team is already created. 2. Only show skapa nytt team text and input fields if not team is joined or created. 3. More input fields to create team: "inactive hours" from 22-07 as default, but the two hour markings can be changed. 4. If a team is created, the user joins the team automatically. 4b. when a team is created the creating user is automatically joined to the team as administrator5. the team scren displays all info about the team including a list of members (username and if they are admins) if there is a team connected to the user. 6. all users connected to the team can either be members or admins and you can assign the admin status in the list of members connected to the team.

add functionality: I hantera team: i listan på users i teamet ska det stå Is admin på kolumnen som man kan toggla. Om det bara är en medlem kan man inte ta bort admin. Man ska kunna ta bort hela teamet i teamlistan, då ska allt rensas och. Under Inactive hours ska en qr kod visas som används för att ansluta till teamet. Den ska visa 8 siffror och man kan också ange dessa siffror manuellt. Om man skriver rätt så ansluts man till det teamet. När man skapar teamet ska de 8 siffrorna för anslutning genereras.

Lägg till en knapp "Gå med i "team via QR-kod" som öppnar kameran och låter dig scanna en kod som sen används för att gå med i ett team som har de 8 siffrorna som man skannar in. man går med i teamet som icke admin. Lägg också till en knapp: "Gå med i team med kod" som öppnar ett inputfält med 8 siffror och en acceptknapp som kontrollerar om man skrivit en kod till ett aktivt team och gå med i det som användare, (inte admin). Felhantering om inte teamet finns. Under Välkommen ska det vara en text som besrkiver vilket team man är med i och om man inte är med i något team ska knapparna jag beskrev synas.