# teamradar
expo start -c 
är bäst då rensar man 

# todo
köp i appen
emergency button
dela upp teamet i grupper om två, tre el 4
betalningar och uppdelning, utlägg, vem ska betala vem?
kudos, green card, pokaler som kudos som syns.

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

# trouble lista och id
id i en lista item.id är inte samma som userid tex. 

# Tailwind
npm install twrnc

# vector icons to make icons and modern
npm install react-native-vector-icons

# picker select
npm install react-native-picker-select

# date time picker install TILLFÄLLIGT BORTTTAGEN
npm install @react-native-community/datetimepicker

Om fel med navigation, kolla att inte någon kommentar är inne i stack navigator

# create index collection
Steps to Create the Firestore Index
Open the Firebase Console: Go to the Firebase Console.
Select Your Project: Select your project (teamradar-c118e).
Go to Firestore Database: In the left-hand menu, click on "Firestore Database".
Indexes: Click on the "Indexes" tab.
Create Index: Click on the "Create Index" button.
Configure the Index:
Collection ID: messages
Fields:
teamId - Ascending
timestamp - Ascending
Create: Click the "Create" button to create the index.


mer problem: 
 (NOBRIDGE) ERROR  ReferenceError: Property 'Constants' doesn't exist

 expo install expo-constants
 

#############################

BUILD

##############################
expo prebuild to create gradle.file?

The slug field in your app.json file should be a short, URL-friendly identifier for your app. It should not contain spaces or special characters. Currently, your slug is set to "How to keep in touch with your team.", which is not a valid slug.

npm install -g eas-cli
eas init

eas build:configure
eas build --platform android --profile production
generate a new keystore in the cloud

firebaseconfig  är inte i git, därför funkar det inte, måste flytta till eas.json och göra följande:
npm install expo-constants

const firebaseConfig = {
  apiKey: Constants.manifest.extra.FIREBASE_API_KEY,
  authDomain: Constants.manifest.extra.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.manifest.extra.FIREBASE_PROJECT_ID
     apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY || "dfsfsdf",
    authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN || "dfsfsfdsf",
    projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || "dfdsfsfs",
    
};

git add src/firebaseConfig.js
git commit -m "Use environment variables for Firebase config"
eas build --platform android

fler problem med Kotlin version?
npx expo-doctor
paket som inte är uppdaterade: 
npx expo install --check

expo prebuild
expo install react-native-reanimated

ändrat i build.gradle: 
 //kotlinVersion = findProperty('android.kotlinVersion') ?: '2.0.21'
        kotlinVersion = '1.9.24' //bytt

        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion") / nytt

fler fel med kotlin: i gradle:  DET FUNKAR: 
configurations.all {
        resolutionStrategy {
            force "org.jetbrains.kotlin:kotlin-stdlib:1.9.24"
            force "org.jetbrains.kotlin:kotlin-reflect:1.9.24"
            force "org.jetbrains.kotlin:kotlin-compiler-embeddable:1.9.24"
        }

        eas build --platform android --profile production

        nu funkar det till slut. build finsihed

###############################
# PROMPTS: teamChat:
please help me to: 1. remove the skapa team buttom when a team is already created. 2. Only show skapa nytt team text and input fields if not team is joined or created. 3. More input fields to create team: "inactive hours" from 22-07 as default, but the two hour markings can be changed. 4. If a team is created, the user joins the team automatically. 4b. when a team is created the creating user is automatically joined to the team as administrator5. the team scren displays all info about the team including a list of members (username and if they are admins) if there is a team connected to the user. 6. all users connected to the team can either be members or admins and you can assign the admin status in the list of members connected to the team.

add functionality: I hantera team: i listan på users i teamet ska det stå Is admin på kolumnen som man kan toggla. Om det bara är en medlem kan man inte ta bort admin. Man ska kunna ta bort hela teamet i teamlistan, då ska allt rensas och. Under Inactive hours ska en qr kod visas som används för att ansluta till teamet. Den ska visa 8 siffror och man kan också ange dessa siffror manuellt. Om man skriver rätt så ansluts man till det teamet. När man skapar teamet ska de 8 siffrorna för anslutning genereras.

Lägg till en knapp "Gå med i "team via QR-kod" som öppnar kameran och låter dig scanna en kod som sen används för att gå med i ett team som har de 8 siffrorna som man skannar in. man går med i teamet som icke admin. Lägg också till en knapp: "Gå med i team med kod" som öppnar ett inputfält med 8 siffror och en acceptknapp som kontrollerar om man skrivit en kod till ett aktivt team och gå med i det som användare, (inte admin). Felhantering om inte teamet finns. Under Välkommen ska det vara en text som besrkiver vilket team man är med i och om man inte är med i något team ska knapparna jag beskrev synas.

as soon as an not-expired team is joined, the user starts tracking position and update to firestore which can be seen by everyone in the team on the map. The update frequency is added to the usernamescreen with default value one minute but there is a dropdown where you can select from 10 seconds, 1 minute, 3 minutes, 10 minutes. When the team is between the inactive hours, no user position is stored or updated in the map. when the user is in an active team, user screen also has a button where the user can toggle update position on and off, then name of that toggle is "göm mig".

Ändra: 1. chatten är kopplad till ett team. bara de som är med i ett team kan läsa och skriva till den team-chatten. 2. I varje chatmeddelande ska username som skriver meddelandet synas. 3. så fort ett meddelande skickas, kontrollera alla i teamets notifieringsinstälningar för chat och pusha en notifiering till de som har notifiering för chat true. 4. När ett team raderas tas hela chatten bort.

in the map screen, if i mark a position (with a long press) I can decide to set a gathering point in  a pop up which will be marked in a special way. The gathering point coordinates is stored with the team and shown to all team members. The next time I press the gathering point icon om the map, i get a selection to remove gathering point or "gather now". If "gather is selected. A notification is sent to all team users with a notification setting set to enabled. It shoud say "Dags att samlas, se på kartan var vi ska träffas."

skapa sidan extrafunctionsscreens som inneh¨ller följande: en meny, en tillbakaknapp och följande funktioner: 1. Välj en slumpvis teammedlem. Den ska slumpa fram en lagmedlem och visa namnet på den. Sedan sätter man en seting på medlemmen som är wasPicked= true 2. Välj en slumpvis lagmedlem som inte slumpats fram innan. Den slumpar fram en lagmedlem som har wasPicked= false. 3. Skapa 2, 3 eller 4 grupper av laget och visa dessa. Gruppernas namn ska vara ett nummer. spara temporarygroup med en siffra hos medlemmarna som är med i grupperna och skriv över nästa gång en ny sub-grupp skapas

skapa en toggle för att låsa teamet för nya medlemmar islockedfornewmembers i teamsettingsscreen. Denna ska sparas i databasen. default är false. Skapa också en informationText som också ska sparas i databsen och kan editeras i teamsettingsscreen.

visa bara qr-koden i teamscreen samt teamkoden om teamet inte är locked for new members. Om det är locked, skriv att det är låst för nya användare och att man kan ändra i teaminställningar om man är administratör. Bara en administratör kan se knappen  teaminstälningar. 

Show the QR code and team code only if the team is not locked for new members.
Display a message indicating that the team is locked for new members if it is locked.
Ensure that only administrators can see the "Team Settings" button.
Make the input field for informationText in TeamSettingsScreen 5 rows high.

2025-03-17
lägg till knappar där man kan "dela upp teamet i två och två" och "dela upp gruppen i tre och tre" där man parar ihop två personer i en grupp eller tre personer i varje grupp. Om teamet bara innehåller två personer ska dessa knappar inte synas. Visa inte knapparna creategroups(3) och (4) som redan finns om teamet innehåller 3 eller färre medlemmar.

if team expiry date has passed, don't show the button to the map or the chat, replace it with an alert that the "Teamets giltighetstid har passerat, ändra i teaminstälningar" In team settings screen, display expiry date and a setting to extend with 3 days if pressed.

in the team setting sscreen add toggle boxes for the new fields and a text before them on the same line. Like "Aktivera ekonomifunktioner", "aktivera kudos och grönt kort" och "aktivera nödknapp". 

BUILD

expo prebuild
eas build --platform android --profile production


start tracking pos code: 

export const startTrackingPosition = async (inactiveHoursStart, inactiveHoursEnd, updateFrequency) => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission to access location was denied');
            return;
        }

        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
            console.log('Ingen userId hittad i local storage');
            return;
        }

        const userRef = doc(db, 'users', userId);

        // Watch the user's position continuously
        Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: updateFrequency, // Minimum time interval between updates
                distanceInterval: 10, // Minimum distance (in meters) between updates
            },
            async (location) => {
                const currentHour = new Date().getHours();

                // Check if the current time is within inactive hours
                if (
                    (inactiveHoursStart < inactiveHoursEnd &&
                        currentHour >= inactiveHoursStart &&
                        currentHour < inactiveHoursEnd) ||
                    (inactiveHoursStart > inactiveHoursEnd &&
                        (currentHour >= inactiveHoursStart || currentHour < inactiveHoursEnd))
                ) {
                    console.log('Inactive hours, not updating position');
                    return;
                }

                // Update the user's position in Firestore
                await updateDoc(userRef, {
                    location: {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        timestamp: location.timestamp,
                    },
                });

                console.log('Position updated:', location);
            }
        );

        console.log('Started tracking position');
    } catch (error) {
        console.error('Error starting position tracking:', error);
    }
};

removeuserfrom team from teamutils
export const removeUserFromTeam = async (user, setTeam, setMembers) => {
    try {
        if (!user || !user.teamId) {
            alert("Ingen giltig användare eller team.");
            return;
        }

        const teamId = user.teamId;

        // Remove the user from the team members collection
        const memberQuery = query(
            collection(db, "teams", teamId, "members"),
            where("userId", "==", user.userId)
        );
        const memberSnapshot = await getDocs(memberQuery);
        memberSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });

        // Update the user's teamId to null
        await updateDoc(doc(db, "users", user.userId), {
            teamId: null,
            isAdmin: false,
        });

        // Clear the team and members state
        setTeam(null);
        setMembers([]);

        // Stop tracking the user's position
        stopTrackingPosition();

        alert("Du har lämnat teamet.");
    } catch (error) {
        console.error("Fel vid borttagning från team:", error);
    }
};

debug om kracsh
adb logcat, ladda ner android dev sdk och sätt path
enable usb debugging
adb logcat findstr com.teamradar

adb *:E hittar felet
BUGGFIX

ENVIRONEMENT VARIABLES

npm install expo-env
npm install -g eas-cli

eas secrets:set FIREBASE_API_KEY="AIzaSyD7vhdeLqD2iLDmQ56bxE1nzH9C3NTJstE"
eas secrets:set FIREBASE_AUTH_DOMAIN: "teamradar-c118e.firebaseapp.com"
eas secrets:set FIREBASE_PROJECT_ID: "teamradar-c118e"

eas secrets:set FIREBASE_STORAGE_BUCKET="teamradar-c118e.firebasestorage.app"
eas secrets:set FIREBASE_MESSAGING_SENDER_ID="293037580610"
eas secrets:set FIREBASE_APP_ID="your-firebase-app-id"


    apiKey: Constants.expoConfig.extra.FIREBASE_API_KEY,
    authDomain: Constants.expoConfig.extra.FIREBASE_AUTH_DOMAIN,
    projectId: Constants.expoConfig.extra.FIREBASE_PROJECT_ID,
    storageBucket: "teamradar-c118e.firebasestorage.app",
    messagingSenderId: "293037580610",
    appId: "1:293037580610:web:7dc37a0aed470e0c6068db"

    how to reach: expo dev, builds-> configuration ->environemnt variables->
    
    npm install dotenv

    skapat en app.config.js
