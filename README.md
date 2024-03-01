# Rizzly
#### We are 2 21 year olds awaiting university matriculation and this is our first dating app project 
## Features: 
- Framework: React Native
-  State Container: Redux
-  Database: Firebase
## Overview: 
#### Do you face issues such as catfishing and ghosting when you are using existing dating apps? Rizzly will mitigate that and more through our very own Selfie Capture function and other functions which prevent inactivity in chats for long periods of time. 
## Description: 
#### We implemented a mandatory selfie taking function in the sign up page, which ensures transparency when using the dating app. This ensures that all users are "verified" and there will lesser catfishing incidents. We also implemented a firebase cloud function which checks chatrooms for inactivity. If a chatroom shows an inactivity of more than 72 hours, then the chatroom will be closed permanently and users will lose their matches. Users can also choose to pause their accounts if they feel too overwhelmed, or block certain email addresses. Users data and privacy are our biggest priority. We ensure that all the data sent by users are hashed or stored securely in firebase to reduce the chances of data leaks.
## Explanation of the files: 
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

## Try it yourself: 
### Scan this QR code to be able to use Rizzly!

## Future improvements:  
