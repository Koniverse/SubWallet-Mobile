// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useState } from 'react';
import { RootState } from './stores';
import { useSelector } from 'react-redux';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { CreateAccount } from 'screens/CreateAccount';
import { StatusBar } from 'react-native';
import { ThemeContext } from 'providers/contexts';
import { THEME_PRESET } from 'styles/themes';
import { ToastProvider } from 'react-native-toast-notifications';
import { QrScanner } from 'screens/QrScanner';
import { QrScannerProvider } from 'providers/QrScannerProvider';
import { RootStackParamList } from 'types/routes';
import { Home } from 'screens/Home';
import { AccountsScreen } from 'screens/AccountsScreen';
import { EditAccount } from 'screens/EditAccount';
import { RemoveAccount } from 'screens/RemoveAccount';
import { RestoreJson } from 'screens/RestoreJson';
import { ViewPrivateKey } from 'screens/ViewPrivateKey';
import { NetworkSelect } from 'screens/NetworkSelect';
import { FirstScreen } from 'screens/FirstScreen';
import { ImportSecretPhrase } from 'screens/ImportSecretPhrase';
import { NetworksSetting } from 'screens/NetworksSetting';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { SendFund } from 'screens/Sending';
import { Settings } from 'screens/Settings';
import { Languages } from 'screens/Settings/Languages';
import { Security } from 'screens/Settings/Security';
import { LockScreen } from 'screens/LockScreen';
import { ExportJson } from 'screens/ExportJson';
import { ImportPrivateKey } from 'screens/ImportPrivateKey';
import { PinCodeScreen } from 'screens/Settings/Security/PinCodeScreen';
import useSetupI18n from 'hooks/init/useSetupI18n';
import { WebViewDebugger } from 'screens/WebViewDebugger';
import useAppLock from 'hooks/useAppLock';
import useCryptoReady from 'hooks/init/useCryptoReady';
import useSetupAccounts from 'hooks/store/useSetupAccounts';
import useSetupSettings from 'hooks/store/useSetupSettings';
import useSetupNetworkMap from 'hooks/store/useSetupNetworkMap';
import useSetupChainRegistry from 'hooks/store/useSetupChainRegistry';
import useSetupPrice from 'hooks/store/useSetupPrice';
import useSetupBalance from 'hooks/store/useSetupBalance';
import useSetupTransactionHistory from 'hooks/store/useSetupTransactionHistory';
import SplashScreen from 'react-native-splash-screen';

export const App = () => {
  const isLock = useAppLock().isLock;
  const [isAppReady, setIsAppReady] = useState(false);
  const isCryptoReady = useCryptoReady();
  const isI18nReady = useSetupI18n().isI18nReady;
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const [isEmptyAccountList, setIsEmptyAccountList] = useState(accounts && accounts.length > 0);

  // Fetching data from web-runner to redux
  const isAccountReady = useSetupAccounts();
  const isSettingReady = useSetupSettings();
  const isNetworkMapReady = useSetupNetworkMap();
  useSetupChainRegistry();
  useSetupPrice();
  useSetupBalance();
  useSetupTransactionHistory();

  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const isDarkMode = true;
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;
  StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');

  useEffect(() => {
    setIsEmptyAccountList(accounts && accounts.length > 0);
  }, [accounts]);

  useEffect(() => {
    const _appReady = isCryptoReady && isI18nReady && isSettingReady && isAccountReady && isNetworkMapReady;
    setIsAppReady(_appReady);
    if (_appReady) {
      SplashScreen.hide();
    }
  }, [isAccountReady, isCryptoReady, isI18nReady, isNetworkMapReady, isSettingReady]);

  if (!isAppReady) {
    return <></>;
  }

  return (
    <ToastProvider
      duration={1500}
      placement="top"
      normalColor={theme.colors.notification}
      successColor={theme.colors.primary}
      warningColor={theme.colors.notification_warning}
      offsetTop={STATUS_BAR_HEIGHT + 40}
      dangerColor={theme.colors.notification_danger}>
      <QrScannerProvider navigationRef={navigationRef}>
        <ThemeContext.Provider value={theme}>
          <NavigationContainer ref={navigationRef} theme={theme}>
            <Stack.Navigator
              initialRouteName={isLock ? 'LockScreen' : isEmptyAccountList ? 'Home' : 'FirstScreen'}
              screenOptions={{
                animation: 'fade_from_bottom',
              }}>
              <Stack.Group screenOptions={{ headerShown: false }}>
                <Stack.Screen name="LockScreen" component={LockScreen} />
                <Stack.Screen name="FirstScreen" component={FirstScreen} />
                <Stack.Screen name="Home" component={Home} options={{ gestureEnabled: false }} />
                <Stack.Screen name="CreateAccount" component={CreateAccount} options={{ title: 'Create Account' }} />
                <Stack.Screen name="AccountsScreen" component={AccountsScreen} options={{ title: 'Account Screen' }} />
                <Stack.Screen name="EditAccount" component={EditAccount} options={{ title: 'Edit Account' }} />
                <Stack.Screen name="RestoreJson" component={RestoreJson} options={{ title: 'Restore JSON' }} />
                <Stack.Screen
                  name="ExportPrivateKey"
                  component={ViewPrivateKey}
                  options={{ title: 'Export Private Key' }}
                />
                <Stack.Screen name="Settings" component={Settings} options={{ title: 'Settings' }} />
                <Stack.Screen name="RemoveAccount" component={RemoveAccount} options={{ title: 'Remove Account' }} />
                <Stack.Screen name="NetworkSelect" component={NetworkSelect} options={{ title: 'Network Select' }} />
                <Stack.Screen
                  name="NetworksSetting"
                  component={NetworksSetting}
                  options={{ title: 'Networks Setting' }}
                />
                <Stack.Screen
                  name="ImportSecretPhrase"
                  component={ImportSecretPhrase}
                  options={{ title: 'Import Secret Phrase' }}
                />
                <Stack.Screen
                  name="ImportPrivateKey"
                  component={ImportPrivateKey}
                  options={{ title: 'Import Private Key' }}
                />
                <Stack.Screen name="SendFund" component={SendFund} options={{ title: 'Send Fund' }} />
                <Stack.Screen name="Languages" component={Languages} options={{ title: 'Languages' }} />
                <Stack.Screen name="Security" component={Security} options={{ title: 'Security' }} />
                <Stack.Screen name="PinCode" component={PinCodeScreen} options={{ title: 'Pin Code' }} />
                <Stack.Screen name="ExportJson" component={ExportJson} options={{ title: 'Export Json' }} />
                <Stack.Screen
                  name="WebViewDebugger"
                  component={WebViewDebugger}
                  options={{ title: 'Web View Debugger' }}
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
    </ToastProvider>
  );
};

export default App;
