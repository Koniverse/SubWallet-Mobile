// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { CreateAccount } from 'screens/CreateAccount';
import { AppState, StatusBar, StyleProp, View } from 'react-native';
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
import { ImportSecretPhrase } from 'screens/ImportSecretPhrase';
import { NetworksSetting } from 'screens/NetworksSetting';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { SendFund } from 'screens/Sending';
import { Settings } from 'screens/Settings';
import { Languages } from 'screens/Settings/Languages';
import { Security } from 'screens/Settings/Security';
import { ExportJson } from 'screens/ExportJson';
import { ImportPrivateKey } from 'screens/ImportPrivateKey';
import { PinCodeScreen } from 'screens/Settings/Security/PinCodeScreen';
import { WebViewDebugger } from 'screens/WebViewDebugger';
import { StoreStatus } from 'stores/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useAppLock from 'hooks/useAppLock';
import useCryptoReady from 'hooks/init/useCryptoReady';
import useSetupI18n from 'hooks/init/useSetupI18n';
import useStoreAccounts from 'hooks/store/useStoreAccounts';
import useStoreSettings from 'hooks/store/useStoreSettings';
import useStoreNetworkMap from 'hooks/store/useStoreNetworkMap';
import useStoreChainRegistry from 'hooks/store/useStoreChainRegistry';
import useStorePrice from 'hooks/store/useStorePrice';
import useStoreBalance from 'hooks/store/useStoreBalance';
import useStoreTransactionHistory from 'hooks/store/useStoreTransactionHistory';
import SplashScreen from 'react-native-splash-screen';
import { LockScreen } from 'screens/LockScreen';
import { LoadingScreen } from 'screens/LoadingScreen';

const viewContainerStyle: StyleProp<any> = {
  position: 'relative',
  flex: 1,
};

function checkRequiredStoresReady(
  accountsStoreStatus: StoreStatus,
  settingsStoreStatus: StoreStatus,
  networkMapStoreStatus: StoreStatus,
): boolean {
  return ![accountsStoreStatus, settingsStoreStatus, networkMapStoreStatus].includes('INIT');
}

const autoLockParams: { pinCodeEnabled: boolean; autoLockTime?: number; lock: () => void } = {
  pinCodeEnabled: false,
  autoLockTime: undefined,
  lock: () => {},
};
let timeout: NodeJS.Timeout | undefined;
AppState.addEventListener('change', (state: string) => {
  if (!autoLockParams.pinCodeEnabled || autoLockParams.autoLockTime === undefined) {
    return;
  }

  if (state === 'background') {
    timeout = setTimeout(() => {
      autoLockParams.lock();
    }, autoLockParams.autoLockTime);
  } else if (state === 'active') {
    timeout && clearTimeout(timeout);
    timeout = undefined;
  }
});

let firstTimeCheckPincode: boolean | undefined;

export const App = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const isDarkMode = true;
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;
  StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');

  const pinCodeEnabled = useSelector((state: RootState) => state.mobileSettings.pinCodeEnabled);
  const autoLockTime = useSelector((state: RootState) => state.mobileSettings.autoLockTime);
  const { isLocked, lock } = useAppLock();

  const isCryptoReady = useCryptoReady();
  const isI18nReady = useSetupI18n().isI18nReady;

  // Fetching data from web-runner to redux
  const accountsStoreStatus = useStoreAccounts();
  const settingsStoreStatus = useStoreSettings();
  const networkMapStoreStatus = useStoreNetworkMap();
  useStoreChainRegistry();
  useStorePrice();
  useStoreBalance();
  useStoreTransactionHistory();

  // Enable lock screen on the start app
  useEffect(() => {
    if (!firstTimeCheckPincode && pinCodeEnabled) {
      lock();
    }
    firstTimeCheckPincode = true;
  }, [lock, pinCodeEnabled]);

  useEffect(() => {
    autoLockParams.lock = lock;
    autoLockParams.autoLockTime = autoLockTime;
    autoLockParams.pinCodeEnabled = pinCodeEnabled;
  }, [autoLockTime, lock, pinCodeEnabled]);

  const isRequiredStoresReady = checkRequiredStoresReady(
    accountsStoreStatus,
    settingsStoreStatus,
    networkMapStoreStatus,
  );

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 100);
  }, []);

  const isAppReady = isRequiredStoresReady && isCryptoReady && isI18nReady;

  useEffect(() => {
    if (isLocked) {
      console.log('Goto : LockScreen');
      navigationRef.navigate('LockScreen');
    } else if (!isAppReady) {
      console.log('Goto : LoadingScreen');
      navigationRef.navigate('LoadingScreen');
    }
  }, [isAppReady, isLocked, navigationRef]);

  // todo: do lazy load in react-native-navigation

  return useMemo(
    () => (
      <View style={viewContainerStyle}>
        <View style={{ flex: 1 }}>
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
                    screenOptions={{
                      animation: 'fade_from_bottom',
                    }}>
                    {isAppReady && (
                      <Stack.Group screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="Home" component={Home} options={{ gestureEnabled: false }} />
                        <Stack.Screen name="CreateAccount" component={CreateAccount} />
                        <Stack.Screen name="AccountsScreen" component={AccountsScreen} />
                        <Stack.Screen name="EditAccount" component={EditAccount} />
                        <Stack.Screen name="RestoreJson" component={RestoreJson} />
                        <Stack.Screen name="ExportPrivateKey" component={ViewPrivateKey} />
                        <Stack.Screen name="Settings" component={Settings} />
                        <Stack.Screen name="RemoveAccount" component={RemoveAccount} />
                        <Stack.Screen name="NetworkSelect" component={NetworkSelect} />
                        <Stack.Screen name="NetworksSetting" component={NetworksSetting} />
                        <Stack.Screen name="ImportSecretPhrase" component={ImportSecretPhrase} />
                        <Stack.Screen name="ImportPrivateKey" component={ImportPrivateKey} />
                        <Stack.Screen name="SendFund" component={SendFund} />
                        <Stack.Screen name="Languages" component={Languages} />
                        <Stack.Screen name="Security" component={Security} />
                        <Stack.Screen name="PinCode" component={PinCodeScreen} />
                        <Stack.Screen name="ExportJson" component={ExportJson} />
                        <Stack.Screen name="WebViewDebugger" component={WebViewDebugger} />
                      </Stack.Group>
                    )}
                    <Stack.Group screenOptions={{ headerShown: false, animation: 'fade' }}>
                      {!isAppReady && <Stack.Screen name="LoadingScreen" component={LoadingScreen} />}
                      <Stack.Screen name="LockScreen" component={LockScreen} />
                    </Stack.Group>
                    <Stack.Group screenOptions={{ presentation: 'modal', headerShown: false }}>
                      <Stack.Screen name="QrScanner" component={QrScanner} />
                    </Stack.Group>
                  </Stack.Navigator>
                </NavigationContainer>
              </ThemeContext.Provider>
            </QrScannerProvider>
          </ToastProvider>
        </View>
      </View>
    ),
    [Stack, isAppReady, navigationRef, theme],
  );
};

export default App;
