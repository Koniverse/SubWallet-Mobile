// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { WebViewProvider } from 'providers/WebViewProvider';
import { persistor, store } from './stores';
import { Provider } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { CreateAccount } from 'screens/CreateAccount';
import { SafeAreaView, StatusBar } from 'react-native';
import { ThemeContext } from 'providers/contexts';
import { THEME_PRESET } from 'styles/themes';
import { ToastProvider } from 'react-native-toast-notifications';
import { AccountList } from 'screens/AccountList';
import { PersistGate } from 'redux-persist/integration/react';
import { QrScanner } from 'screens/QrScanner';
import { QrScannerProvider } from 'providers/QrScannerProvider';
import { RootStackParamList } from 'types/routes';
import { STATUS_BAR_HEIGHT, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { Home } from 'screens/Home';
import { AccountsScreen } from 'screens/AccountsScreen';
import { EditAccount } from 'screens/EditAccount';
import { RemoveAccount } from 'screens/RemoveAccount';
import { RestoreJson } from 'screens/RestoreJson';
import {ColorMap} from "styles/color";

// cryptoWaitReady().then(rs => {
//   console.debug('crypto-ready', rs);
// });

export const App = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const Stack = createNativeStackNavigator<RootStackParamList>();
  // const isDarkMode = useColorScheme() === 'dark';
  const isDarkMode = true;
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;
  StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider
          placement="top"
          normalColor={theme.colors.notification}
          successColor={theme.colors.primary}
          warningColor={theme.colors.notification_warning}
          dangerColor={theme.colors.notification_danger}>
          <WebViewProvider>
            <QrScannerProvider navigationRef={navigationRef}>
              <ThemeContext.Provider value={theme}>
                <SafeAreaView
                  style={{
                    backgroundColor: ColorMap.dark2,
                  }}>
                  <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} />
                </SafeAreaView>
                <NavigationContainer ref={navigationRef} theme={theme}>
                  <Stack.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                      animation: 'fade_from_bottom',
                    }}>
                    <Stack.Group screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="Home" component={Home} />
                      <Stack.Screen
                        name="CreateAccount"
                        component={CreateAccount}
                        options={{ title: 'Create Account' }}
                      />
                      <Stack.Screen name="AccountList" component={AccountList} options={{ title: 'Account List' }} />
                      <Stack.Screen
                        name="AccountsScreen"
                        component={AccountsScreen}
                        options={{ title: 'Account Screen' }}
                      />
                      <Stack.Screen name="EditAccount" component={EditAccount} options={{ title: 'Edit Account' }} />
                      <Stack.Screen name="RestoreJson" component={RestoreJson} options={{ title: 'Restore JSON' }} />
                      <Stack.Screen
                        name="RemoveAccount"
                        component={RemoveAccount}
                        options={{ title: 'Remove Account' }}
                      />
                    </Stack.Group>
                    <Stack.Group
                      screenOptions={{
                        presentation: 'modal',
                        headerShown: false,
                      }}>
                      <Stack.Screen name="QrScanner" component={QrScanner} />
                    </Stack.Group>
                  </Stack.Navigator>
                </NavigationContainer>
              </ThemeContext.Provider>
            </QrScannerProvider>
          </WebViewProvider>
        </ToastProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
