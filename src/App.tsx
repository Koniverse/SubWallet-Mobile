import { ExternalRequestContextProvider } from 'providers/ExternalRequestContext';
import { QrSignerContextProvider } from 'providers/QrSignerContext';
import { ScannerContextProvider } from 'providers/ScannerContext';
import { SigningContextProvider } from 'providers/SigningContext';
import React, { useContext, useEffect, useState } from 'react';
import { AppState, DeviceEventEmitter, Linking, StatusBar, StyleProp, View } from 'react-native';
import { ThemeContext, WebRunnerContext } from 'providers/contexts';
import { THEME_PRESET } from 'styles/themes';
import { ToastProvider } from 'react-native-toast-notifications';
import { FontMedium, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useAppLock from 'hooks/useAppLock';
import useCryptoReady from 'hooks/init/useCryptoReady';
import useSetupI18n from 'hooks/init/useSetupI18n';
import RNBootSplash from "react-native-bootsplash";
import { LoadingScreen } from 'screens/LoadingScreen';
import { ColorMap } from 'styles/color';
import { AutoLockState } from 'utils/autoLock';
import { TOAST_DURATION } from 'constants/index';
import AppNavigator from './AppNavigator';
import { AppModalContextProvider } from 'providers/AppModalContext';
import { CustomToast } from 'components/design-system-ui/toast';
import { PortalProvider } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LockTimeout } from 'stores/types';
import { keyringLock } from './messaging';
import { updateAutoLockTime } from 'stores/MobileSettings';
import { useShowBuyToken } from 'hooks/static-content/useShowBuyToken';
import { useGetDAppList } from 'hooks/static-content/useGetDAppList';
import { NEED_UPDATE_CHROME } from 'providers/WebRunnerProvider/WebRunner';
import { AppOnlineContentContextProvider } from 'providers/AppOnlineContentProvider';
import { GlobalModalContextProvider } from 'providers/GlobalModalContext';
import { useGetAppInstructionData } from 'hooks/static-content/useGetAppInstructionData';
import { useGetConfig } from 'hooks/static-content/useGetConfig';
import { mmkvStore } from 'utils/storage';
import { setIsShowRemindBackupModal } from 'screens/Home';
import { useGetBrowserConfig } from 'hooks/static-content/useGetBrowserConfig';
import RNRestart from 'react-native-restart';
import { GlobalInstructionModalContextProvider } from 'providers/GlobalInstructionModalContext';
import {AlertModal} from 'components/Modal/AlertModal.tsx';

const layerScreenStyle: StyleProp<any> = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  position: 'absolute',
  backgroundColor: ColorMap.dark1,
  zIndex: 10,
};

const gestureRootStyle: StyleProp<any> = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: '100%',
  height: '100%',
  zIndex: 9999,
};

const autoLockParams: {
  hasMasterPassword: boolean;
  isUseBiometric: boolean;
  timeAutoLock?: number;
  lock: () => void;
  isPreventLock: boolean;
  isMasterPasswordLocked: boolean;
} = {
  hasMasterPassword: false,
  isUseBiometric: false,
  timeAutoLock: undefined,
  lock: () => {},
  isPreventLock: false,
  isMasterPasswordLocked: false,
};

let lockWhenActive = false;
AppState.addEventListener('change', (state: string) => {
  const { isUseBiometric, timeAutoLock, lock, isMasterPasswordLocked } = autoLockParams;
  if (timeAutoLock === undefined) {
    return;
  }
  if (AutoLockState.isPreventAutoLock) {
    return;
  }

  if (state === 'background') {
    mmkvStore.set('lastTimeLogin', Date.now());
    if (timeAutoLock === LockTimeout.ALWAYS) {
      // Lock master password incase always require
      setIsShowRemindBackupModal(false);
      keyringLock().catch((e: Error) => console.log(e));
    }
    if (isUseBiometric) {
      lockWhenActive = true;
    } else {
      lockWhenActive = false;
      if (isMasterPasswordLocked) {
        setIsShowRemindBackupModal(false);
        lock();
      }
    }
  } else if (state === 'active') {
    if (lockWhenActive) {
      if (isMasterPasswordLocked) {
        setIsShowRemindBackupModal(false);
        lock();
      }
      lockWhenActive = false;
    }
  }
});

let firstTimeCheckPincode: boolean | undefined;
export let prevDeeplinkUrl = '';

export function setPrevDeeplinkUrl(value: string) {
  prevDeeplinkUrl = value;
}

export const isHandleDeeplinkPromise = { current: true };

export function setIsHandleDeeplinkPromise(value: boolean) {
  isHandleDeeplinkPromise.current = value;
}

export const App = () => {
  const isDarkMode = true;
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;
  StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');

  const { isUseBiometric, timeAutoLock, isPreventLock } = useSelector((state: RootState) => state.mobileSettings);
  const { hasMasterPassword, isLocked } = useSelector((state: RootState) => state.accountState);
  const language = useSelector((state: RootState) => state.settings.language);
  const { lock, unlockApp } = useAppLock();
  const dispatch = useDispatch();
  const isCryptoReady = useCryptoReady();
  const isI18nReady = useSetupI18n().isI18nReady;
  const { checkIsShowBuyToken } = useShowBuyToken();
  const { getDAppsData } = useGetDAppList();
  const { getConfig } = useGetConfig();
  const { getBrowserConfig } = useGetBrowserConfig();
  const { getAppInstructionData } = useGetAppInstructionData(language); // data for app instruction, will replace getEarningStaticData
  const [needUpdateChrome, setNeedUpdateChrome] = useState<boolean>(false);
  const { isUpdateComplete, setUpdateComplete } = useContext(WebRunnerContext);

  // Enable lock screen on the start app
  useEffect(() => {
    if (!firstTimeCheckPincode && isLocked) {
      lock();
    }
    if (!isLocked) {
      unlockApp();
    }
    firstTimeCheckPincode = true;
    autoLockParams.isMasterPasswordLocked = isLocked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked]);

  useEffect(() => {
    autoLockParams.lock = lock;
    autoLockParams.timeAutoLock = timeAutoLock;
    autoLockParams.hasMasterPassword = hasMasterPassword;
    autoLockParams.isUseBiometric = isUseBiometric;
    autoLockParams.isPreventLock = isPreventLock;
  }, [timeAutoLock, isUseBiometric, isPreventLock, lock, hasMasterPassword]);

  const isRequiredStoresReady = true;

  // When update from v1.0.15, time auto lock could be wrong. We can remove this effect later
  useEffect(() => {
    if (!Object.values(LockTimeout).includes(timeAutoLock)) {
      dispatch(updateAutoLockTime(LockTimeout._15MINUTE));
    }
  }, [dispatch, timeAutoLock]);

  useEffect(() => {
    setTimeout(() => {
      RNBootSplash.hide({ fade: true });
    }, 100);
    checkIsShowBuyToken();
    // getPoolInfoMap();
    mmkvStore.delete('poolInfoMap'); // remove unused mmkvStore
    getDAppsData();
    getConfig();
    getBrowserConfig();
    getAppInstructionData();

    DeviceEventEmitter.addListener(NEED_UPDATE_CHROME, (data: boolean) => {
      setNeedUpdateChrome(data);
    });
    // if (buildNumber === 1) {
    // Set default value on the first time install
    // const buildNumberInt = parseInt(getBuildNumber(), 10);
    // dispatch(setBuildNumber(buildNumberInt));
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAppReady = isRequiredStoresReady && isCryptoReady && isI18nReady;

  const onPressUpdateWebView = () => {
    Linking.canOpenURL('market://details?id=com.google.android.webview').then(() =>
      Linking.openURL('market://details?id=com.google.android.webview'),
    );
  };

  const onPressRestart = () => {
    setUpdateComplete && setUpdateComplete(false);
    RNRestart.Restart();
  };

  // TODO: merge GlobalModalContextProvider and AppModalContextProvider

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <>
        {!isUpdateComplete && (
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
                        <GestureHandlerRootView style={gestureRootStyle}>
                          <PortalProvider>
                            <GlobalModalContextProvider>
                              <AppOnlineContentContextProvider>
                                <GlobalInstructionModalContextProvider>
                                  <AppModalContextProvider>
                                    {!needUpdateChrome ? <AppNavigator isAppReady={isAppReady} /> : <></>}
                                  </AppModalContextProvider>
                                </GlobalInstructionModalContextProvider>
                              </AppOnlineContentContextProvider>
                            </GlobalModalContextProvider>
                          </PortalProvider>
                        </GestureHandlerRootView>
                      </ScannerContextProvider>
                    </QrSignerContextProvider>
                  </ExternalRequestContextProvider>
                </SigningContextProvider>
              </ThemeContext.Provider>
            </ToastProvider>
          </View>
        )}
        {!isAppReady && (
          <View style={layerScreenStyle}>
            <LoadingScreen />
          </View>
        )}
        {needUpdateChrome && (<AlertModal onPressBtn={onPressUpdateWebView} theme={theme} headerText={'Outdated Webview'} alertText={"Your Webview version is outdated and doesn't support SubWallet. Update to a new version and try again."} buttonTitle={'Update Webview'} />)}
        {isUpdateComplete && (<AlertModal onPressBtn={onPressRestart} theme={theme} headerText={'Restart your app'} alertText={'The latest version of SubWallet is installed on your device. Restart the app to complete the update'} buttonTitle={'Restart app'} />)}
      </>
    </SafeAreaProvider>
  );
};

export default App;
