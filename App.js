import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeProvider } from '@react-navigation/native';
import { Provider } from 'react-redux';

import RootNavigation from './navigation';
import { Store } from './redux/store';

export default function App() {
  return (
    // <Provider store={Store}>
      <ThemeProvider>
        <RootNavigation />
      </ThemeProvider>
    // </Provider>
  );
};