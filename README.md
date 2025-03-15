# teamradar
expo start -c 
är bäst då rensar man 

# todo
notifieringar
köp i skapa team
tems and conditions vid skapa namn
databasautenticering
layout

# Firebaes authentication
Firebase Authentication provides a way to sign in users anonymously, meaning they don’t have to provide an email, password, or any credentials. Firebase creates a temporary user ID (uid) that persists for that session, allowing them to interact with Firestore securely.
Once signed in, Firebase assigns a unique uid for the session. You can check if a user is authenticated:
Now that the user is authenticated (even anonymously), you can store or retrieve their data from Firestore.
Example sec rules: 
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

# GIT
git config --global user.name "jonaselmlund"
git config --global user.email "jonas.elmlund@gmail.com"

# hur man kör servern:
npx expo start 

# I nfo om react native-appen.
App.js är startsidan.

# Tailwind
npm install twrnc

# asynchstorage för att spara saker lokalt på telefonen
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

# Picker
expo install @react-native-picker/picker

# Expo notification?
npx expo install expo-notifications

# hur man stänger av expo servern om fönstret är stängt?
Open Task Manager (Ctrl + Shift + Esc).
Look for processes named node.js eller ? "node.exe" (since Expo runs on Node.js). node.js
Select it and click "End Task".

# Asset from expo to read files
npx expo install expo-asset
import { Asset } from 'expo-asset';

# kolla att expo camera är installerat när det blir fel i scanningen av QR:
expo install expo-camera

# PROMPTS: teamChat:
please help me to: 1. remove the skapa team buttom when a team is already created. 2. Only show skapa nytt team text and input fields if not team is joined or created. 3. More input fields to create team: "inactive hours" from 22-07 as default, but the two hour markings can be changed. 4. If a team is created, the user joins the team automatically. 4b. when a team is created the creating user is automatically joined to the team as administrator5. the team scren displays all info about the team including a list of members (username and if they are admins) if there is a team connected to the user. 6. all users connected to the team can either be members or admins and you can assign the admin status in the list of members connected to the team.

add functionality: I hantera team: i listan på users i teamet ska det stå Is admin på kolumnen som man kan toggla. Om det bara är en medlem kan man inte ta bort admin. Man ska kunna ta bort hela teamet i teamlistan, då ska allt rensas och. Under Inactive hours ska en qr kod visas som används för att ansluta till teamet. Den ska visa 8 siffror och man kan också ange dessa siffror manuellt. Om man skriver rätt så ansluts man till det teamet. När man skapar teamet ska de 8 siffrorna för anslutning genereras.

Lägg till en knapp "Gå med i "team via QR-kod" som öppnar kameran och låter dig scanna en kod som sen används för att gå med i ett team som har de 8 siffrorna som man skannar in. man går med i teamet som icke admin. Lägg också till en knapp: "Gå med i team med kod" som öppnar ett inputfält med 8 siffror och en acceptknapp som kontrollerar om man skrivit en kod till ett aktivt team och gå med i det som användare, (inte admin). Felhantering om inte teamet finns. Under Välkommen ska det vara en text som besrkiver vilket team man är med i och om man inte är med i något team ska knapparna jag beskrev synas.

as soon as an not-expired team is joined, the user starts tracking position and update to firestore which can be seen by everyone in the team on the map. The update frequency is added to the usernamescreen with default value one minute but there is a dropdown where you can select from 10 seconds, 1 minute, 3 minutes, 10 minutes. When the team is between the inactive hours, no user position is stored or updated in the map. when the user is in an active team, user screen also has a button where the user can toggle update position on and off, then name of that toggle is "göm mig".

Ändra: 1. chatten är kopplad till ett team. bara de som är med i ett team kan läsa och skriva till den team-chatten. 2. I varje chatmeddelande ska username som skriver meddelandet synas. 3. så fort ett meddelande skickas, kontrollera alla i teamets notifieringsinstälningar för chat och pusha en notifiering till de som har notifiering för chat true. 4. När ett team raderas tas hela chatten bort.

in the map screen, if i mark a position (with a long press) I can decide to set a gathering point in  a pop up which will be marked in a special way. The gathering point coordinates is stored with the team and shown to all team members. The next time I press the gathering point icon om the map, i get a selection to remove gathering point or "gather now". If "gather is selected. A notification is sent to all team users with a notification setting set to enabled. It shoud say "Dags att samlas, se på kartan var vi ska träffas."