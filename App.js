import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';

import RootNavigation from './navigation';
import { Store } from './redux/store';

export default function App() {
  return (
    <Provider store={Store}>
      <ThemeProvider>
        <RootNavigation />
      </ThemeProvider>
    </Provider>
  );
};