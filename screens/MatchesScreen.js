import React from 'react';
import { View, Text, Button } from 'react-native';

const MatchesScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Matches Screen</Text>
      <Button
        title="Go to Chat Room"
        onPress={() =>
          navigation.navigate('ChatRoom', { userId: '123', userName: 'John' })
        }
      />
    </View>
  );
};

export default MatchesScreen;
