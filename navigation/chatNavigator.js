import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MatchesScreen from '../screens/MatchesScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import { Button } from 'react-native-elements';
import { Alert } from 'react-native';

const Stack = createStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Matches" component={MatchesScreen} options={{headerShown: false}}/>
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen} 
        options={{
          headerTitle: 'Chat Room',
          headerRight: () => (
            <Button 
              title="Report" 
              color="#fff" 
              onPress={() => {
                Alert.alert(
                  'Report Options',
                  '',
                  [
                    {
                      text:'This is not the real person!',
                      onPress: () => {/* handle option1 here */}
                    },
                    {
                      text:'Inappropriate content/ Harassment',
                      onPress:() => {/* handle option2 here*/}
                    },
                    {
                      text:'Safety issues',
                    onPress: () => {/* handle option3 here */}
                    },
                    {
                      text: 'Cancel',
                      style:'cancel',     
                    }
                  ]
                )
               }} 
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
 };
 