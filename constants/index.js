import icons from "./icons";
import { COLORS, FONT, SIZES, SHADOWS } from "./theme";

export { icons, COLORS, FONT, SIZES, SHADOWS };
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';

import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
// App.js or index.js

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/navigation/MainStack'; // Create this stack in the next step

const App = () => {
  return (
    <NavigationContainer>
      <MainStack />
    </NavigationContainer>
  );
};

export default App;
