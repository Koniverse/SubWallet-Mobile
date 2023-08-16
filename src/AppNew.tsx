// Copyright 2019-2022 @subwallet/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { ExternalRequestContextProvider } from 'providers/ExternalRequestContext';
import { QrSignerContextProvider } from 'providers/QrSignerContext';
import { ScannerContextProvider } from 'providers/ScannerContext';
import { SigningContextProvider } from 'providers/SigningContext';
import React, { useEffect } from 'react';
import { AppState, Platform, StatusBar, StyleProp, View } from 'react-native';
import { ThemeContext } from 'providers/contexts';
import { THEME_PRESET } from 'styles/themes';
import { ToastProvider } from 'react-native-toast-notifications';
import { FontMedium, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useAppLock from 'hooks/useAppLock';
import useCryptoReady from 'hooks/init/useCryptoReady';
import useSetupI18n from 'hooks/init/useSetupI18n';
import SplashScreen from 'react-native-splash-screen';
import { LoadingScreen } from 'screens/LoadingScreen';
import { ColorMap } from 'styles/color';
import { AutoLockState } from 'utils/autoLock';
import useStoreBackgroundService from 'hooks/store/useStoreBackgroundService';
import { HIDE_MODAL_DURATION, TOAST_DURATION } from 'constants/index';
import AppNavigator from './AppNavigator';
import { keyringLock } from 'messaging/index';
import { updateShowZeroBalanceState } from 'stores/utils';
import { setBuildNumber } from './stores/AppVersion';
import { getBuildNumber } from 'react-native-device-info';
import { AppModalContextProvider } from './providers/AppModalContext';
import { CustomToast } from 'components/design-system-ui/toast';
import { PortalProvider } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const layerScreenStyle: StyleProp<any> = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  position: 'absolute',
  backgroundColor: ColorMap.dark1,
  zIndex: 10,
};

AutoLockState.isPreventAutoLock = false;
const autoLockParams: {
  pinCodeEnabled: boolean;
  faceIdEnabled: boolean;
  autoLockTime?: number;
  lock: () => void;
  isPreventLock: boolean;
} = {
  pinCodeEnabled: false,
  faceIdEnabled: false,
  isPreventLock: false,
  autoLockTime: undefined,
  lock: () => {},
};
let timeout: NodeJS.Timeout | undefined;
let lockWhenActive = false;
AppState.addEventListener('change', (state: string) => {
  const { pinCodeEnabled, faceIdEnabled, autoLockTime, lock, isPreventLock } = autoLockParams;

  if (state === 'background' && !isPreventLock) {
    keyringLock().catch((e: Error) => console.log(e));
  }

  if (!pinCodeEnabled || autoLockTime === undefined) {
    return;
  }

  if (state === 'background') {
    timeout = setTimeout(() => {
      if (AutoLockState.isPreventAutoLock) {
        return;
      }
      if (faceIdEnabled) {
        lockWhenActive = true;
      } else {
        lockWhenActive = false;
        Platform.OS === 'android' ? setTimeout(() => lock(), HIDE_MODAL_DURATION) : lock();
      }
    }, autoLockTime);
  } else if (state === 'active') {
    if (lockWhenActive) {
      if (!AutoLockState.isPreventAutoLock) {
        Platform.OS === 'android' ? setTimeout(() => lock(), HIDE_MODAL_DURATION) : lock();
      }
      lockWhenActive = false;
    }
    timeout && clearTimeout(timeout);
    timeout = undefined;
  }
});

let firstTimeCheckPincode: boolean | undefined;

export const AppNew = () => {
  const isDarkMode = true;
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;
  StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');

  const { pinCodeEnabled, faceIdEnabled, autoLockTime, isPreventLock } = useSelector(
    (state: RootState) => state.mobileSettings,
  );
  const { hasMasterPassword } = useSelector((state: RootState) => state.accountState);
  const { buildNumber } = useSelector((state: RootState) => state.appVersion);
  const { lock } = useAppLock();
  const dispatch = useDispatch();

  const isCryptoReady = useCryptoReady();
  const isI18nReady = useSetupI18n().isI18nReady;
  useStoreBackgroundService();

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
    autoLockParams.isPreventLock = isPreventLock;
  }, [autoLockTime, faceIdEnabled, isPreventLock, lock, pinCodeEnabled]);

  const isRequiredStoresReady = true;

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 100);
  }, []);

  useEffect(() => {
    if (buildNumber === 1) {
      // Set default value on the first time install
      updateShowZeroBalanceState(false);
      const buildNumberInt = parseInt(getBuildNumber(), 10);
      dispatch(setBuildNumber(buildNumberInt));
    }
    if (hasMasterPassword) {
      keyringLock().catch((e: Error) => console.log(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAppReady = isRequiredStoresReady && isCryptoReady && isI18nReady;

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <>
        <View style={{ flex: 1 }}>
          <ToastProvider
            duration={TOAST_DURATION}
            renderToast={toast => <CustomToast toast={toast} />}
            placement="top"
            normalColor={theme.colors.notification}
            textStyle={{ textAlign: 'center', ...FontMedium }}
            successColor={theme.colors.primary}
            warningColor={theme.colors.notification_warning}
            offsetTop={STATUS_BAR_HEIGHT + 40}
            dangerColor={theme.colors.notification_danger}>
            <ThemeContext.Provider value={theme}>
              <SigningContextProvider>
                <ExternalRequestContextProvider>
                  <QrSignerContextProvider>
                    <ScannerContextProvider>
                      <GestureHandlerRootView
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          width: '100%',
                          height: '100%',
                          zIndex: 9999,
                        }}>
                        <PortalProvider>
                          <AppModalContextProvider>
                            <AppNavigator isAppReady={isAppReady} />
                          </AppModalContextProvider>
                        </PortalProvider>
                      </GestureHandlerRootView>
                    </ScannerContextProvider>
                  </QrSignerContextProvider>
                </ExternalRequestContextProvider>
              </SigningContextProvider>
            </ThemeContext.Provider>
          </ToastProvider>
        </View>
        {!isAppReady && (
          <View style={layerScreenStyle}>
            <LoadingScreen />
          </View>
        )}
      </>
    </SafeAreaProvider>
  );
};

export default AppNew;
