import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MatchesScreen from '../screens/MatchesScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import { useSelector } from 'react-redux';
import Report from '../screens/Report';
import ViewOtherProfile from '../screens/ViewOtherProfile';
import { Button, TouchableOpacity, Alert } from 'react-native';
import { Text, Image } from 'react-native-elements';

const Stack = createStackNavigator();

const CustomHeaderTitle = ({ userFirstName, imageUrl, navigation, matchId }) => (
  <TouchableOpacity
    style={{ flexDirection: 'row', alignItems: 'center' }}
    onPress={() => navigation.navigate('ViewOtherProfile', { matchId })}
  >
    <Image
      style={{
        width: 50,
        height: 50,
        borderRadius: 25,
        marginLeft: 0,
        marginRight: 10,
      }}
      source={{ uri: imageUrl }}
    />
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{userFirstName}</Text>
  </TouchableOpacity>
);

export default function ChatStack() {
  const matches = useSelector(state => state.editProfileReducer.matchesVal);

  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen name="Matches" component={MatchesScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route, navigation }) => {
          const currentMatchId = route.params?.userId;
          const currentMatch = matches.find(match => match.id === currentMatchId);
          const userFirstName = currentMatch ? currentMatch.firstName : '';
          const imageUrl = currentMatch && currentMatch.imageURLs && currentMatch.imageURLs.length > 0
            ? currentMatch.imageURLs[0]
            : null;

          return {
            headerTitle: () => <CustomHeaderTitle userFirstName={userFirstName} imageUrl={imageUrl} navigation={navigation} matchId={currentMatchId} />,
            headerRight: () => (
              <Button
                title="Report"
                type="outline"
                buttonStyle={{ borderColor: '#000', backgroundColor: '#000' }}
                titleStyle={{ color: '#fff' }}
                onPress={() => {
                  Alert.alert(
                    'Report Options',
                    '',
                    [
                      {
                        text: 'This is not the real person!',
                        onPress: () => navigation.navigate('Report')
                      },
                      {
                        text: 'Inappropriate content/ Harassment',
                        onPress: () => navigation.navigate('Report')
                      },
                      {
                        text: 'Safety issues',
                        onPress: () => navigation.navigate('Report')
                      },
                      {
                        text: 'Cancel',
                        style: 'cancel',
                      }
                    ]
                  )
                }}
              />
            ),
          };
        }}
      />
      <Stack.Screen name="Report" component={Report} />
      <Stack.Screen name="ViewOtherProfile" component={ViewOtherProfile} />
    </Stack.Navigator>
  );
}
