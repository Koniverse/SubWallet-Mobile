// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useMemo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, StackActions, useNavigationContainerRef } from '@react-navigation/native';
import { CreateAccount } from 'screens/CreateAccount';
import { AppState, StatusBar, StyleProp, View } from 'react-native';
import { ThemeContext } from 'providers/contexts';
import { THEME_PRESET } from 'styles/themes';
import { ToastProvider } from 'react-native-toast-notifications';
import { RootStackParamList } from 'types/routes';
import { Home } from 'screens/Home';
import { AccountsScreen } from 'screens/AccountsScreen';
import { EditAccount } from 'screens/EditAccount';
import { RemoveAccount } from 'screens/RemoveAccount';
import { RestoreJson } from 'screens/RestoreJson';
import { ViewPrivateKey } from 'screens/ViewPrivateKey';
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
import useStoreCrowdloan from 'hooks/store/useStoreCrowdloan';
import { BrowserSearch } from 'screens/Home/Browser/BrowserSearch';
import { BrowserTab } from 'screens/Home/Browser/BrowserTab';
import useStoreConfirmation from 'hooks/store/useStoreConfirmation';
import useStoreAuthUrls from 'hooks/store/useStoreAuthUrls';
import { ConfirmationPopup } from 'screens/Home/Browser/ConfirmationPopup';

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

const autoLockParams: { pinCodeEnabled: boolean; faceIdEnabled: boolean; autoLockTime?: number; lock: () => void } = {
  pinCodeEnabled: false,
  faceIdEnabled: false,
  autoLockTime: undefined,
  lock: () => {},
};
let timeout: NodeJS.Timeout | undefined;
let lockWhenActive = false;
AppState.addEventListener('change', (state: string) => {
  const { pinCodeEnabled, faceIdEnabled, autoLockTime, lock } = autoLockParams;
  if (!pinCodeEnabled || autoLockTime === undefined) {
    return;
  }

  if (state === 'background') {
    timeout = setTimeout(() => {
      if (faceIdEnabled) {
        lockWhenActive = true;
      } else {
        lockWhenActive = false;
        lock();
      }
    }, autoLockTime);
  } else if (state === 'active') {
    if (lockWhenActive) {
      lock();
      lockWhenActive = false;
    }
    timeout && clearTimeout(timeout);
    timeout = undefined;
  }
});

let firstTimeCheckPincode: boolean | undefined;
const DONT_GO_BACK_LIST = ['LoadingScreen', 'LockScreen'];

export const App = () => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const isDarkMode = true;
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;
  StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');

  const { pinCodeEnabled, faceIdEnabled, autoLockTime } = useSelector((state: RootState) => state.mobileSettings);
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
  useStoreCrowdloan();
  useStoreAuthUrls();
  useStoreConfirmation();

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
    autoLockParams.faceIdEnabled = faceIdEnabled;
  }, [autoLockTime, faceIdEnabled, lock, pinCodeEnabled]);

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
      navigationRef.navigate('LockScreen');
    } else if (!isAppReady) {
      navigationRef.navigate('LoadingScreen');
    } else {
      // Go back to latest screen not in DONT_GO_BACK_LIST
      const currentRoutes = navigationRef?.getState().routes || [];
      const needGoBackTimes = [...currentRoutes].filter(r => DONT_GO_BACK_LIST.includes(r.name)).length;
      if (needGoBackTimes > 0 && navigationRef.canGoBack() && currentRoutes.length > needGoBackTimes) {
        navigationRef.dispatch(StackActions.pop(needGoBackTimes));
      } else {
        navigationRef.navigate('Home');
      }
    }
  }, [isAppReady, isLocked, navigationRef]);

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
                      <Stack.Screen name="NetworksSetting" component={NetworksSetting} />
                      <Stack.Screen name="ImportSecretPhrase" component={ImportSecretPhrase} />
                      <Stack.Screen name="ImportPrivateKey" component={ImportPrivateKey} />
                      <Stack.Screen name="SendFund" component={SendFund} />
                      <Stack.Screen name="Languages" component={Languages} />
                      <Stack.Screen name="Security" component={Security} />
                      <Stack.Screen name="PinCode" component={PinCodeScreen} />
                      <Stack.Screen name="ExportJson" component={ExportJson} />
                      <Stack.Screen name="BrowserSearch" component={BrowserSearch} />
                      <Stack.Screen name="BrowserTab" component={BrowserTab} />
                      <Stack.Screen name="WebViewDebugger" component={WebViewDebugger} />
                    </Stack.Group>
                  )}
                  <Stack.Group screenOptions={{ headerShown: false, animation: 'fade' }}>
                    {!isAppReady && <Stack.Screen name="LoadingScreen" component={LoadingScreen} />}
                    <Stack.Screen name="LockScreen" component={LockScreen} />
                  </Stack.Group>
                  <Stack.Group
                    screenOptions={{
                      presentation: 'transparentModal',
                      contentStyle: { backgroundColor: 'rgba(22, 22, 22, 0.8)' },
                      headerShown: false,
                    }}>
                    <Stack.Screen name="ConfirmationPopup" component={ConfirmationPopup} />
                  </Stack.Group>
                </Stack.Navigator>
              </NavigationContainer>
            </ThemeContext.Provider>
          </ToastProvider>
        </View>
      </View>
    ),
    [Stack, isAppReady, navigationRef, theme],
  );
};

export default App;
