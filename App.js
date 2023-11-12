import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';

import RootNavigation from './navigation';
import { Store } from './redux/store';

const Stack = createStackNavigator();

const HomeScreen = () => <Text>Home Screen</Text>;

const NavigationStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Home' component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    // <Provider store={Store}>
      <ThemeProvider>
        <RootNavigation />
      </ThemeProvider>
    // </Provider>
  );
};

const AppContainer = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <NavigationStack />
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default AppContainer;
