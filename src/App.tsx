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
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import {CreateAccount} from './screens/CreateAccount';
import {StatusBar, useColorScheme} from 'react-native';
import {ThemeContext} from './providers/contexts';
import {THEME_PRESET} from './themes';
import {Header} from './components/Header';

export type RootStackParamList = {
  Home: undefined;
  CreateAccount: undefined;
};

export type NavigationProps =
  NativeStackScreenProps<RootStackParamList>['navigation'];
export type RouteProps = NativeStackScreenProps<RootStackParamList>['route'];

export const App = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const isDarkMode = useColorScheme() === 'dark';
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;

  return (
    <Provider store={store}>
      <WebViewProvider>
        <ThemeContext.Provider value={theme}>
          <StatusBar backgroundColor={theme.colors.background} />
          <Header navigationRef={navigationRef} />
          <NavigationContainer ref={navigationRef} theme={theme}>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                animation: 'fade_from_bottom',
              }}>
              <Stack.Group screenOptions={{headerShown: false}}>
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen
                  name="CreateAccount"
                  component={CreateAccount}
                  options={{title: 'Create Account'}}
                />
              </Stack.Group>
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeContext.Provider>
      </WebViewProvider>
    </Provider>
  );
};

export default App;
