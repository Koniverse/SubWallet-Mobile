import { ExternalRequestContextProvider } from 'providers/ExternalRequestContext';
import { QrSignerContextProvider } from 'providers/QrSignerContext';
import { ScannerContextProvider } from 'providers/ScannerContext';
import { SigningContextProvider } from 'providers/SigningContext';
import React, { useEffect, useState } from 'react';
import { AppState, DeviceEventEmitter, ImageBackground, Linking, StatusBar, StyleProp, View } from 'react-native';
import { ThemeContext } from 'providers/contexts';
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
import { useGetEarningStaticData } from 'hooks/static-content/useGetEarningStaticData';
import { useGetConfig } from 'hooks/static-content/useGetConfig';
import { mmkvStore } from 'utils/storage';
import { setIsShowRemindBackupModal } from 'screens/Home';

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
  height: deviceHeight,
  backgroundColor: 'black',
};

AppState.addEventListener('change', (state: string) => {
  const { timeAutoLock, lock, isMasterPasswordLocked } = autoLockParams;
  const lastTimeLogin = mmkvStore.getNumber('lastTimeLogin') || 0;
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

    if (isMasterPasswordLocked) {
      setIsShowRemindBackupModal(false);
      lock();
    }
  } else if (state === 'active') {
    const isLockApp = Date.now() - lastTimeLogin > timeAutoLock * 60000;
    if (isLockApp) {
      setIsShowRemindBackupModal(false);
      lock();
    }
  }
});

let firstTimeCheckPincode: boolean | undefined;
export let prevDeeplinkUrl = '';

export function setPrevDeeplinkUrl(value: string) {
  prevDeeplinkUrl = value;
}

export const isFirstOpen = { current: true };

export function setIsFirstOpen(value: boolean) {
  isFirstOpen.current = value;
}

export const App = () => {
  const isDarkMode = true;
  const theme = isDarkMode ? THEME_PRESET.dark : THEME_PRESET.light;
  StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');

  const { timeAutoLock, isPreventLock } = useSelector((state: RootState) => state.mobileSettings);
  const { hasMasterPassword, isLocked } = useSelector((state: RootState) => state.accountState);
  const language = useSelector((state: RootState) => state.settings.language);
  const { lock, unlockApp } = useAppLock();
  const dispatch = useDispatch();
  const isCryptoReady = useCryptoReady();
  const isI18nReady = useSetupI18n().isI18nReady;
  const { checkIsShowBuyToken } = useShowBuyToken();
  const { getDAppsData } = useGetDAppList();
  const { getConfig } = useGetConfig();
  const { getEarningStaticData } = useGetEarningStaticData(language);
  const [needUpdateChrome, setNeedUpdateChrome] = useState<boolean>(false);
  autoLockParams.isMasterPasswordLocked = isLocked;

  // Enable lock screen on the start app
  useEffect(() => {
    if (!firstTimeCheckPincode && isLocked) {
      lock();
    }
    if (!isLocked) {
      unlockApp();
    }
    firstTimeCheckPincode = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLocked]);
  useEffect(() => {
    autoLockParams.lock = lock;
    autoLockParams.timeAutoLock = timeAutoLock;
    autoLockParams.hasMasterPassword = hasMasterPassword;
    autoLockParams.isPreventLock = isPreventLock;
  }, [timeAutoLock, isPreventLock, lock, hasMasterPassword, isLocked]);

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
    getDAppsData();
    getConfig();
    getEarningStaticData();

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
                      <GestureHandlerRootView style={gestureRootStyle}>
                        <PortalProvider>
                          <AppModalContextProvider>
                            {!needUpdateChrome ? <AppNavigator isAppReady={isAppReady} /> : <></>}
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
                  opacity: 0.8,
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
      </>
    </SafeAreaProvider>
  );
};

export default App;
