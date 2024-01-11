import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MatchesScreen from '../screens/MatchesScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import { useSelector, useDispatch } from 'react-redux';
import Report from '../screens/Report'
import { Button } from 'react-native-elements';
import { Alert } from 'react-native';

const Stack = createStackNavigator();

export default function ChatStack() {
  const matches = useSelector(state => state.editProfileReducer.matchesVal);

  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Matches" component={MatchesScreen} options={{headerShown: false}}/>
      <Stack.Screen 
        name="ChatRoom" 
        component={ChatRoomScreen} 
        options={({ navigation }) => ({
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
                     onPress: () => navigation.navigate('Report')
                   },
                   {
                     text:'Inappropriate content/ Harassment',
                     onPress: () => navigation.navigate('Report')
                   },
                   {
                     text:'Safety issues',
                     onPress: () => navigation.navigate('Report')
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
        })}
      />
      <Stack.Screen name="Report" component={Report}/>
    </Stack.Navigator>
  );
 };
 
 