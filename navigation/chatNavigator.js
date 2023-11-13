import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MatchesScreen from '../screens/MatchesScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';

const Stack = createStackNavigator();

export default function ChatStack() {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Matches" component={MatchesScreen} options={{headerShown: false}}/>
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
    </Stack.Navigator>
  );
};