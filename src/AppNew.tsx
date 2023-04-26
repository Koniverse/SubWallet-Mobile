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
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useAppLock from 'hooks/useAppLock';
import useCryptoReady from 'hooks/init/useCryptoReady';
import useSetupI18n from 'hooks/init/useSetupI18n';
import SplashScreen from 'react-native-splash-screen';
import { LockScreen } from 'screens/LockScreen';
import { LoadingScreen } from 'screens/LoadingScreen';
import { ColorMap } from 'styles/color';
import { AutoLockState } from 'utils/autoLock';
import useStoreBackgroundService from 'hooks/store/useStoreBackgroundService';
import { HIDE_MODAL_DURATION, TOAST_DURATION } from 'constants/index';
import AppNavigator from './AppNavigator';

const viewContainerStyle: StyleProp<any> = {
  position: 'relative',
  flex: 1,
};

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

  const { pinCodeEnabled, faceIdEnabled, autoLockTime } = useSelector((state: RootState) => state.mobileSettings);
  const { isLocked, lock } = useAppLock();

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
  }, [autoLockTime, faceIdEnabled, lock, pinCodeEnabled]);

  const isRequiredStoresReady = true;

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 100);
  }, []);

  const isAppReady = isRequiredStoresReady && isCryptoReady && isI18nReady;

  return (
    <View style={viewContainerStyle}>
      <View style={{ flex: 1 }}>
        <ToastProvider
          duration={TOAST_DURATION}
          placement="top"
          normalColor={theme.colors.notification}
          textStyle={{ textAlign: 'center' }}
          successColor={theme.colors.primary}
          warningColor={theme.colors.notification_warning}
          offsetTop={STATUS_BAR_HEIGHT + 40}
          dangerColor={theme.colors.notification_danger}>
          <ThemeContext.Provider value={theme}>
            <SigningContextProvider>
              <ExternalRequestContextProvider>
                <QrSignerContextProvider>
                  <ScannerContextProvider>
                    <>
                      <AppNavigator isAppReady={isAppReady} />
                    </>
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
      {isLocked && (
        <View style={layerScreenStyle}>
          <LockScreen />
        </View>
      )}
    </View>
  );
};

export default AppNew;
