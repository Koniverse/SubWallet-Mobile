import { ExternalRequestContextProvider } from 'providers/ExternalRequestContext';
import { QrSignerContextProvider } from 'providers/QrSignerContext';
import { ScannerContextProvider } from 'providers/ScannerContext';
import { SigningContextProvider } from 'providers/SigningContext';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { AppState, DeviceEventEmitter, ImageBackground, Linking, StatusBar, StyleProp, View } from 'react-native';
import { ThemeContext, WebRunnerContext } from 'providers/contexts';
import { THEME_PRESET } from 'styles/themes';
import { ToastProvider } from 'react-native-toast-notifications';
import { FontMedium, FontSemiBold, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import useAppLock from 'hooks/useAppLock';
import useCryptoReady from 'hooks/init/useCryptoReady';
import useSetupI18n from 'hooks/init/useSetupI18n';
import SplashScreen from 'react-native-splash-screen';
import { LoadingScreen } from 'screens/LoadingScreen';
import { ColorMap } from 'styles/color';
import { AutoLockState } from 'utils/autoLock';
import { deviceHeight, deviceWidth, TOAST_DURATION } from 'constants/index';
import AppNavigator from './AppNavigator';
import { AppModalContextProvider } from 'providers/AppModalContext';
import { CustomToast } from 'components/design-system-ui/toast';
import { PortalProvider } from '@gorhom/portal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LockTimeout } from 'stores/types';
import { keyringLock } from './messaging';
import { updateAutoLockTime } from 'stores/MobileSettings';
import { useShowBuyToken } from 'hooks/static-content/useShowBuyToken';
import { useGetDAppList } from 'hooks/static-content/useGetDAppList';
import { NEED_UPDATE_CHROME } from 'providers/WebRunnerProvider/WebRunner';
import { Button, Icon, Image, PageIcon, Typography } from 'components/design-system-ui';
import { Warning } from 'phosphor-react-native';
import { Images } from 'assets/index';
import Text from 'components/Text';
import i18n from 'utils/i18n/i18n';
import { useGetEarningPoolData } from 'hooks/static-content/useGetEarningPoolData';
import { AppOnlineContentContextProvider } from 'providers/AppOnlineContentProvider';
import { GlobalModalContextProvider } from 'providers/GlobalModalContext';
import { useGetAppInstructionData } from 'hooks/static-content/useGetAppInstructionData';
import { useGetConfig } from 'hooks/static-content/useGetConfig';
import { mmkvStore } from 'utils/storage';
import { setIsShowRemindBackupModal } from 'screens/Home';
import { useGetBrowserConfig } from 'hooks/static-content/useGetBrowserConfig';
import RNRestart from 'react-native-restart';
import { ImageLogosMap } from 'assets/logo';
import { GlobalInstructionModalContextProvider } from 'providers/GlobalInstructionModalContext';
import BackgroundTimer from 'react-native-background-timer';

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

const logoTextStyle: StyleProp<any> = {
  fontSize: 38,
  lineHeight: 46,
  ...FontSemiBold,
  color: ColorMap.light,
  paddingTop: 9,
};

const logoSubTextStyle: StyleProp<any> = {
  fontSize: 16,
  lineHeight: 24,
  ...FontMedium,
  color: 'rgba(255, 255, 255, 0.65)',
  paddingTop: 12,
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

const imageBackgroundStyle: StyleProp<any> = {
  justifyContent: 'flex-end',
  position: 'relative',
  width: deviceWidth,
  height: deviceHeight + STATUS_BAR_HEIGHT,
  backgroundColor: 'black',
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
    console.log('timeAutoLock', timeAutoLock);
    if (timeAutoLock === LockTimeout.ALWAYS) {
      // Lock master password incase always require
      setIsShowRemindBackupModal(false);
      keyringLock().catch((e: Error) => console.log(e));
    } else {
      BackgroundTimer.start();
      setTimeout(() => {
        setIsShowRemindBackupModal(false);
        lock();
      }, timeAutoLock * 60 * 1000);
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
    BackgroundTimer.stop();
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
  const { getPoolInfoMap } = useGetEarningPoolData();
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
      SplashScreen.hide();
    }, 100);
    checkIsShowBuyToken();
    getPoolInfoMap();
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
        {needUpdateChrome && (
          <View style={{ width: deviceWidth, height: deviceHeight, justifyContent: 'flex-end' }}>
            <ImageBackground source={Images.backgroundImg} resizeMode={'contain'} style={imageBackgroundStyle}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  paddingBottom: 40,
                  alignItems: 'center',
                  backgroundColor: theme.swThemes.colorBgSecondary,
                  opacity: 0.3,
                  marginBottom: -32,
                }}>
                <Image src={Images.SubWalletLogoGradient} style={{ width: 66, height: 100 }} />
                <Text style={logoTextStyle}>SubWallet</Text>
                <Text style={logoSubTextStyle}>{i18n.title.slogan}</Text>
              </View>
              <View
                style={{
                  maxHeight: deviceHeight * 0.6,
                  backgroundColor: theme.swThemes.colorBgDefault,
                  borderTopLeftRadius: theme.swThemes.borderRadiusXXL,
                  borderTopRightRadius: theme.swThemes.borderRadiusXXL,
                }}>
                <View
                  style={{
                    paddingTop: theme.swThemes.paddingXS,
                    paddingHorizontal: theme.swThemes.padding,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: 70,
                      height: 5,
                      borderRadius: 100,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      marginBottom: 16,
                    }}
                  />
                  <Typography.Title
                    style={{
                      color: theme.swThemes.colorWhite,
                      fontSize: theme.swThemes.fontSizeXL,
                      lineHeight: theme.swThemes.fontSizeXL * theme.swThemes.lineHeightHeading4,
                      paddingBottom: theme.swThemes.paddingXL,
                    }}>
                    {'Outdated Webview'}
                  </Typography.Title>
                  <PageIcon
                    customIcon={<Icon phosphorIcon={Warning} iconColor={theme.swThemes.colorWarning} customSize={64} />}
                    color={theme.swThemes.colorWarning}
                    backgroundColor={'rgba(217, 197, 0, 0.1)'}
                  />
                  <Typography.Text
                    style={{
                      color: theme.swThemes.colorTextLight4,
                      textAlign: 'center',
                      paddingTop: theme.swThemes.paddingMD,
                      ...FontMedium,
                    }}>
                    {
                      "Your Webview version is outdated and doesn't support SubWallet. Update to a new version and try again."
                    }
                  </Typography.Text>
                </View>
                <Button onPress={onPressUpdateWebView} style={{ margin: 16 }}>
                  Update Webview
                </Button>
                <SafeAreaView edges={['bottom']} />
              </View>
            </ImageBackground>
          </View>
        )}
        {isUpdateComplete && (
          <View style={{ width: deviceWidth, height: deviceHeight + STATUS_BAR_HEIGHT, justifyContent: 'flex-end' }}>
            <ImageBackground source={Images.backgroundImg} resizeMode={'cover'} style={imageBackgroundStyle}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  paddingBottom: 40,
                  alignItems: 'center',
                  backgroundColor: theme.swThemes.colorBgSecondary,
                  opacity: 0.3,
                  marginBottom: -32,
                }}>
                <Image src={Images.SubWalletLogoGradient} style={{ width: 66, height: 100 }} />
                <Text style={logoTextStyle}>SubWallet</Text>
                <Text style={logoSubTextStyle}>{i18n.title.slogan}</Text>
              </View>
              <View
                style={{
                  maxHeight: deviceHeight * 0.6,
                  backgroundColor: theme.swThemes.colorBgDefault,
                  borderTopLeftRadius: theme.swThemes.borderRadiusXXL,
                  borderTopRightRadius: theme.swThemes.borderRadiusXXL,
                }}>
                <View
                  style={{
                    paddingTop: theme.swThemes.paddingXS,
                    paddingHorizontal: theme.swThemes.padding,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: 70,
                      height: 5,
                      borderRadius: 100,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      marginBottom: 16,
                    }}
                  />
                  <Typography.Title
                    style={{
                      color: theme.swThemes.colorWhite,
                      fontSize: theme.swThemes.fontSizeXL,
                      lineHeight: theme.swThemes.fontSizeXL * theme.swThemes.lineHeightHeading4,
                      paddingBottom: theme.swThemes.paddingXL,
                    }}>
                    {'Restart your app'}
                  </Typography.Title>
                  <Suspense>
                    <ImageLogosMap.RestartLogo width={112} height={112} />
                  </Suspense>
                  <Typography.Text
                    style={{
                      color: theme.swThemes.colorTextLight4,
                      textAlign: 'center',
                      paddingTop: theme.swThemes.paddingMD,
                      paddingHorizontal: theme.swThemes.paddingLG,
                      ...FontMedium,
                    }}>
                    {
                      'The latest version of SubWallet is installed on your device. Restart the app to complete the update'
                    }
                  </Typography.Text>
                </View>
                <Button onPress={onPressRestart} style={{ marginTop: 16, marginHorizontal: 16, marginBottom: 46 }}>
                  Restart app
                </Button>
                <SafeAreaView edges={['bottom']} />
              </View>
            </ImageBackground>
          </View>
        )}
      </>
    </SafeAreaProvider>
  );
};

export default App;
