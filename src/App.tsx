// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import {WebViewProvider} from './providers/WebViewProvider';
import {Home} from './screens/Home';
import {store} from './stores';
import {Provider} from 'react-redux';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {CreateAccount} from './screens/CreateAccount';
import {useColorScheme} from 'react-native';

export type RootStackParamList = {
  Home: undefined;
  CreateAccount: undefined;
};

export type NavigationProps =
  NativeStackScreenProps<RootStackParamList>['navigation'];
export type RouteProps = NativeStackScreenProps<RootStackParamList>['route'];

export const App = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <WebViewProvider>
        <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="CreateAccount" component={CreateAccount} />
          </Stack.Navigator>
        </NavigationContainer>
      </WebViewProvider>
    </Provider>
  );
};

export default App;
