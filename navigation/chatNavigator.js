import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MatchesScreen from '../screens/MatchesScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import { useSelector, useDispatch } from 'react-redux';
import Report from '../screens/Report'
import { Button } from 'react-native-elements';
import { Alert, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import { Image } from 'react-native-elements';

const Stack = createStackNavigator();

const CustomHeaderTitle = ({ userFirstName, imageUrl }) => (
  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Image
      style={{
        width: 50,
        height: 50,
        borderRadius: 25, // Make it half of width and height to create a circular shape
        marginLeft: 0, // Add left margin to separate the image and text
        marginRight: 10, // Add right margin to separate the image from other content
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
          const currentMatchId = route.params.userId; // Assuming you have the user ID in your route params
          const currentMatch = matches.find(match => match.id === currentMatchId);
          const userFirstName = currentMatch ? currentMatch.firstName : '';
          const imageUrl = currentMatch && currentMatch.imageURLs && currentMatch.imageURLs.length > 0
            ? currentMatch.imageURLs[0]
            : null;

          return {
            headerTitle: () => <CustomHeaderTitle userFirstName={userFirstName} imageUrl={imageUrl} />,
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
    </Stack.Navigator>
  );
}