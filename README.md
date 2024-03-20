# Rizzly
We are two 20 year olds based in Singapore awaiting university matriculation and this is our full-stack dating app project in the works! Feel free to test on Android with the QR code below.
## Features: 
- Framework: React Native
- Database: Firebase
## Overview: 
Do you face issues such as catfishing and ghosting when you are using existing dating apps? Rizzly will mitigate that and more through our very own Selfie Capture function and other functions which prevent inactivity in chats for long periods of time. 
## Description: 
We implemented a mandatory selfie taking function in the sign up page, which ensures transparency when using the dating app. This ensures that all users are "verified" and there will lesser catfishing incidents. We also implemented a cloud function which checks chatrooms for inactivity. If a chatroom shows an inactivity of more than 72 hours, then the chatroom will be closed permanently and users will lose their matches. Users can also choose to pause their accounts if they feel too overwhelmed, or block certain email addresses. Users data and privacy are our biggest priority. We ensure that all the data sent by users are hashed or stored securely in firebase to reduce the chances of data leaks.
## Explanation of the files:
### Screens folder:
| Files  | Description |
|-----:|---------------|
|     AboutMe.js|               |
|     BlockList.js|   This page is involved in ensuring that the users with blocked emails provided will not be shown to the current user, vice versa.           |
|     ChatRoomScreen.js|    This is the ChatRoom page for users to hold their private conversations with their matches. Users are also allowed to take pictures and upload it to these private chatrooms. If there is no activity in this chatroom, it will close after 72 hours.           |
|   Children.js  |   Set up number of children current user has        |
|  Contact.js   |    This screen allows users to send messages about any query or doubt they might have pertaining to the app. The messages will be sent directly to us and only we can view it. This ensures privacy but also openness between users and us.      |
|  DeleteAccount.js   |  This page causes the deletion of the current account. The user can only delete their accounts if they have the passwords to it. All of the current user's data will be removed from the database if they choose to delete their accounts.         |
|    EditPhotos.js |    This page allows users to edit their profile photos      |
|    EditProfileScreen.js |           |
|   Education.js  |    Set up current user's education       |
|  haversine.js   |    This file contains the code to calculate the latitude and longitude of a person for reverse geocoding       |
|  Homescreen.js   |     This page holds the main chunk of the app. It shows the available users to the current user , assuming he/she is not blocked/filtered/disliked already. There is a like and dislike button, along with a filter modal and a userinformation modal. The filter modal allows users to filter results based on height, distance and age. The userinformation modal shows all other user information in detail such as number of retakes for selfie function, distance between current user and displayed user, etc.       |
|  LikesScreen.js   |  This screen shows all the users who have liked the current user         |
|   LoadingScreen.js  |    A custom loading screen with a walking gRizzly bear. This is to align with our design.       |
|   Location.js  |    Set up current user's location      |
|   MatchesScreen.js  |   Matches screen shows all matches the current user has. The criteria for forming a match is if the users have mutually clicked the like button when viewing each others profile. This screen also allows users to navigate between private chats with different matches.      |
|   MyGender.js  |    Set up current user's gender       |
|   MyName.js  |  Set up current user's name         |
|   NoMoreUserScreen.js  |    Custom screen to display no more users when the user has scrolled through all available results       |
|   PauseProfile.js  |   This screen allows users to pause the activity of their account. This will lead to them only being able to mingle with current matches. They will no longer be shown to other users and their will not be able to see other users.        |
|  Religion.js   |    Screen to set up the current user's religion |
|   Report.js  |    This screen plays an important role to ensure users' safety when using the app. The report button is found in chatrooms so that any foul play or activity can be reported right away. Rizzly does not condone such actions and any one found committing these acts will be banned rightaway.       |
|   Settings.js  |     The Settings Screen allows users to navigate to more specific settings in the drawer component.      |
|  Sexuality.js   |   Set up current user's sexual orientation/gender they prefer to see.        |
|  Units.js |   This page allows for users to toggle between different metrics and units of measurement, allowing users to have a more personalised experience.       |
|   Vices.js  |   Set up current user's vices such as smoking,vaping,etc.        |
|  ViewOtherProfile.js   |  This screen enables users to view their matches profile when chatting with them in their private chatrooms. Just click their names/profile picture and they will be led to this page        |
|   ViewProfile.js  |    Ensures users can see their own profile after creating an account. This will give them a rough perspective of how others view their profiles on Rizzly.      |
|   Work.js  |   Set up user's current occupation/job      |

### Important Root files: 
| Root | Description |
|-----:|---------------|
| app.config.js | Expo configuration file, includes settings for ios and android and extra configurations for EAS and Firebase |
|App.js | Entry point for the app, wraps the root navigation component with Redux provider to provide global redux store to app|
|babel.config.js | 	Configuration for Babel, a JavaScript compiler. Includes presets and plugins used by my app|
|eas.json | 	Configuration for EAS Build and EAS Submit, includes settings for different build profiles and environment variables for my EAS Build |
|index.js |Imports the entry point for the router in your project. Used to start your app |
|package-lock.json | Automatically generated by npm, describes the exact tree that was generated when npm install last ran |
|package.json |Contains list of dependencies required by the app |
|tsconfig.json | 	Configuration for TypeScript compiler options for the app|
|config/firebase.ts |	Initializes Firebase, creates a Firebase App object with the Firebase project configuration and exports it along with a Firestore database instance |
|utils/hooks/useAuthentication.ts	 | Contains custom React hook that manages the user's authentication state by setting up a listener for changes in the user's sign-in state and updates its local state accordingly |

### Redux: 
| Redux | Description |
|-----:|---------------|
|actions.js|Contains action creators, functions that return an action where each action has a type and a payload.|
|reducers.js	|Contains reducers, which are functions that take the previous state and an action, and return the next state|
|store.js|Creates the Redux store, which brings together the state, actions, and reducers, and adds thunk middleware to the store|
|userReducer.js|This code is used to manage user-related state in a Redux store, allowing for centralized state management in a React application|

### Navigation: 
| NavStack | Description |
|-----:|---------------|
|authNavigator.js|Contains navigation to facillitate the authentication of users in pages signinPhone, signinEmail, signupPhone, signupEmail, welcome|
|bottomTabNavigator.js| In charge of allowing users to move between HomeScreen.js, LikesScreen.js, MatchesScreen.js. |
|drawerNavigator.js| Similar to a drawer, when the icon is clicked, a sleek panel elegantly slides out from the left side of the screen, offering users convenient access to navigate between various sections including settings, edit profile, and logout pages. |
|editProfileNavigator.js| This code holds the different screens of current user data. It allows users to edit their data and save changes. Updated changes will show immediately on HomeScreen and ViewProfile. |

### Components: 
#### Components are essential to the UI of our dating app 

### Constants: 
| Constants | Description |
|-----:|---------------|
|icons.js|	Imports icons from the asset file|
|index.js|	Exports icons and theme constants for easy use in other pages|
|theme.js|	Contains common colors, sizes, fonts, and shadows for use in other pages |

## Try it yourself: 
### Download Expo Go from Google Play Store to test!
#### Android:
![QR Code](./screenshots/AndroidQRCode.png)

## Updates to look forward to in future:  
- A more refined algorithm. We will be using skill based matchmaking whereby users will be shown based on a few categories, namely popularity, time spent using the app and responsiveness. 
- Minor bug fixes for notifications so users receive notifications in their emails 
- Better language support so international users can also use Rizzly 
- More fun features await
