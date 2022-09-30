import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { NativeSyntheticEvent, Platform, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { AccountSettingButton } from 'components/AccountSettingButton';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import {
  ArrowClockwise,
  CaretLeft,
  CaretRight,
  DotsThree,
  GlobeSimple,
  HouseSimple,
  IconProps,
  LockSimple,
  LockSimpleOpen,
  MagnifyingGlass,
} from 'phosphor-react-native';
import { IconButton } from 'components/IconButton';
import { FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { EmptyListPlaceholder } from 'screens/Home/Browser/EmptyListPlaceholder';
import { WebRunnerContext } from 'providers/contexts';
import WebView from 'react-native-webview';
import {
  WebViewMessage,
  WebViewNavigation,
  WebViewNavigationEvent,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';
import { MESSAGE_ORIGIN_PAGE } from '@subwallet/extension-base/defaults';
import * as RNFS from 'react-native-fs';
import { DEVICE } from 'constants/index';
import { BrowserService } from 'screens/Home/Browser/BrowserService';
import { BrowserOptionModal, BrowserOptionModalRef } from 'screens/Home/Browser/BrowserOptionModal';
import { addToHistory, updateLatestItemInHistory, updateTab, updateTabScreenshot } from 'stores/updater';
import { getHostName } from 'utils/browser';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { SiteInfo } from 'stores/types';
import { Bar as ProgressBar } from 'react-native-progress';
import { captureScreen } from 'react-native-view-shot';

export interface BrowserTabRef {
  goToSite: (siteInfo: SiteInfo) => void;
}

type Props = {
  tabId: string;
  tabsNumber: number;
  onOpenBrowserTabs: () => void;
};

const headerWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  paddingBottom: 12,
  width: '100%',
  paddingLeft: 60,
  paddingRight: 60,
  position: 'relative',
  height: 56,
};

const headerLeftSideStyle: StyleProp<any> = {
  position: 'absolute',
  left: 16,
  top: 2,
};

const headerRightSideStyle: StyleProp<any> = {
  position: 'absolute',
  right: 7,
  top: 2,
};

type BrowserActionButtonType = {
  key: string;
  icon?: (iconProps: IconProps) => JSX.Element;
  onPress: () => void;
  isDisabled?: boolean;
};

type NavigationInfo = {
  canGoBack: boolean;
  canGoForward: boolean;
};

type InjectPageJsScriptType = {
  content: string | null;
  init: () => Promise<string>;
  get: () => Promise<string>;
};

const BridgeScript = `(function () {
  window.addEventListener('message', ({ data, source }) => {
    // only allow messages from our window, by the inject
    if (source !== window || data.origin !== '${MESSAGE_ORIGIN_PAGE}') {
      return;
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({...data, origin: window.location.href}));
  });
})();`;

const InjectPageJsScript: InjectPageJsScriptType = {
  content: null,

  async init() {
    let pageJsContent;
    if (Platform.OS === 'ios') {
      pageJsContent = await RNFS.readFile(`${RNFS.MainBundlePath}/PageJs.bundle/page.js`, 'ascii');
    } else {
      pageJsContent = await RNFS.readFileAssets('PageJs.bundle/page.js', 'ascii');
    }

    this.content = BridgeScript + pageJsContent;

    return this.content;
  },
  async get() {
    if (this.content) {
      return this.content;
    }

    return await this.init();
  },
};

const getJsInjectContent = (showLog?: boolean) => {
  let injectedJS = '';
  // Show webview log in development environment
  if (showLog) {
    injectedJS += `
  const consoleLog = (type, args) => window.ReactNativeWebView.postMessage(JSON.stringify({id: '-2', 'response': [type, ...args]}));
  console = {
      log: (...args) => consoleLog('log', [...args]),
      debug: (...args) => consoleLog('debug', [...args]),
      info: (...args) => consoleLog('info', [...args]),
      warn: (...args) => consoleLog('warn', [...args]),
      error: (...args) => consoleLog('error', [...args]),
  };`;
  }

  return injectedJS;
};

const nameSiteTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  ...FontSize0,
  color: ColorMap.disabled,
  paddingHorizontal: 20,
  marginTop: -2,
};

const hostNameTextStyle: StyleProp<any> = {
  paddingLeft: 4,
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
};

const tabButtonStyle: StyleProp<any> = {
  width: 20,
  height: 20,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderRadius: 4,
  borderColor: ColorMap.light,
};

const progressBarStyle: StyleProp<any> = { position: 'absolute', top: 0, right: 0, left: 0, height: 3 };

const bottomButtonAreaStyle: StyleProp<any> = {
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  backgroundColor: ColorMap.dark1,
  borderTopColor: ColorMap.dark2,
  borderTopWidth: 1,
  paddingVertical: 12,
  alignItems: 'center',
};

//todo: Update better style
const PhishingBlockerLayer = () => {
  return (
    <View
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: ColorMap.modalBackDropDarkColor,
        position: 'absolute',
      }}>
      <View style={{ backgroundColor: ColorMap.modalBackDropDarkColor }}>
        <Warning isDanger title={i18n.title.phishingDetected} message={i18n.warningMessage.phishingMessage} />
      </View>
    </View>
  );
};

const Component = ({ tabId, tabsNumber, onOpenBrowserTabs }: Props, ref: ForwardedRef<BrowserTabRef>) => {
  const navigation = useNavigation<RootNavigationProps>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [initWebViewSource, setInitWebViewSource] = useState<string | null>(null);
  const [progressNumber, setProgressNumber] = useState<number>(0);
  const { eventEmitter } = useContext(WebRunnerContext);
  const [{ canGoBack, canGoForward }, setNavigationInfo] = useState<NavigationInfo>({
    canGoBack: false,
    canGoForward: false,
  });
  const [injectedPageJs, setInjectedPageJs] = useState<string | null>(null);
  const [isShowPhishingWarning, setIsShowPhishingWarning] = useState<boolean>(false);
  const webviewRef = useRef<WebView>(null);
  const browserSv = useRef<BrowserService | null>(null);
  const siteUrl = useRef<string | null>(null);
  const siteName = useRef('');
  const browserOptionModalRef = useRef<BrowserOptionModalRef>(null);
  const hostname = siteUrl.current ? getHostName(siteUrl.current) : null;
  const isUrlSecure = siteUrl.current ? siteUrl.current.startsWith('https://') : false;
  const LockIcon = isUrlSecure ? LockSimple : LockSimpleOpen;

  const isWebviewReady = !!(initWebViewSource && injectedPageJs);

  const clearCurrentBrowserSv = () => {
    browserSv.current?.onDisconnect();
  };

  const initBrowserSv = (nativeEvent: WebViewNavigation) => {
    if (eventEmitter) {
      browserSv.current = new BrowserService({
        webRunnerEventEmitter: eventEmitter,
        browserWebviewRef: webviewRef,
        url: nativeEvent.url,
        onHandlePhishing: () => {
          // clear content of the phishing site
          webviewRef.current?.injectJavaScript("(function(){document.documentElement.innerHTML='' })()");
          setIsShowPhishingWarning(true);
        },
      });
    }
  };

  const updateSiteInfo = ({ url, name }: SiteInfo) => {
    siteUrl.current = url;
    siteName.current = name || url;
  };

  const updateNavigationInfo = (nativeEvent: WebViewNavigation) => {
    setNavigationInfo({
      canGoBack: nativeEvent.canGoBack,
      // currently the method goForward() of react webview does not work on Android
      // todo: find a way to overcome this issue
      canGoForward: DEVICE.isAndroid ? false : nativeEvent.canGoForward,
    });
  };

  const updateBrowserOptionModalRef = ({ url, title }: WebViewNavigation) => {
    browserOptionModalRef.current?.onUpdateSiteInfo({
      url,
      name: title || url,
    });
  };

  const onWebviewMessage = (eventData: NativeSyntheticEvent<WebViewMessage>) => {
    const content = eventData.nativeEvent.data;

    try {
      const { id, message, request, origin } = JSON.parse(content);

      // doesn't need 'request' check here
      if (id && message && origin) {
        browserSv.current?.onMessage({ id, message, request, origin });
      }
    } catch (e) {
      console.log('onWebviewMessage Error', e);
    }
  };

  const onLoad = ({ nativeEvent }: WebViewNavigationEvent) => {
    if (nativeEvent.url !== siteUrl.current || nativeEvent.title !== siteName.current) {
      if (nativeEvent.url !== siteUrl.current) {
        updateTab({ id: tabId, url: nativeEvent.url });
      }

      updateSiteInfo({ url: nativeEvent.url, name: nativeEvent.title });
      updateNavigationInfo(nativeEvent);

      updateLatestItemInHistory({
        url: nativeEvent.url,
        name: nativeEvent.title || nativeEvent.url,
      });
      updateBrowserOptionModalRef(nativeEvent);
    }
  };

  const onLoadStart = ({ nativeEvent }: WebViewNavigationEvent) => {
    if (nativeEvent.url !== siteUrl.current) {
      updateTab({ id: tabId, url: nativeEvent.url });
      updateSiteInfo({ url: nativeEvent.url, name: nativeEvent.title });
    }

    updateNavigationInfo(nativeEvent);

    addToHistory({
      url: nativeEvent.url,
      name: nativeEvent.title || nativeEvent.url,
    });

    updateBrowserOptionModalRef(nativeEvent);

    setIsShowPhishingWarning(false);

    // clear the current service and init the new one
    clearCurrentBrowserSv();
    initBrowserSv(nativeEvent);
  };

  const goBack = () => {
    navigation.navigate('Home', { tab: 'Browser' });
  };

  const bottomButtonList: BrowserActionButtonType[] = [
    {
      key: 'back',
      icon: CaretLeft,
      onPress: () => {
        if (!canGoBack) {
          return;
        }
        const { current } = webviewRef;
        current && current.goBack && current.goBack();
      },
      isDisabled: !canGoBack,
    },
    {
      key: 'forward',
      icon: CaretRight,
      onPress: () => {
        if (!canGoForward) {
          return;
        }
        const { current } = webviewRef;
        current && current.goForward && current.goForward();
      },
      isDisabled: !canGoForward,
    },
    {
      key: 'search',
      icon: MagnifyingGlass,
      onPress: () => {
        navigation.navigate('BrowserSearch');
      },
    },
    {
      key: 'tabs',
      onPress: () => {
        captureScreen({
          format: 'jpg',
          quality: 1,
          width: DEVICE.width,
          height: DEVICE.height,
        })
          .then(screenShot => {
            updateTabScreenshot(tabId, screenShot);
          })
          .catch(e => {
            console.log('Error when taking screenshot:', e);
          })
          .finally(() => {
            onOpenBrowserTabs();
          });
      },
    },
    {
      key: 'reload',
      icon: ArrowClockwise,
      onPress: () => {
        const { current } = webviewRef;
        current && current.reload && current.reload();
      },
    },
    {
      key: 'more',
      icon: DotsThree,
      isDisabled: !isWebviewReady,
      onPress: () => {
        setModalVisible(true);
      },
    },
  ];

  useEffect(() => {
    let isSync = true;

    (async () => {
      const injectPageJsContent = await InjectPageJsScript.get();

      if (isSync) {
        setInjectedPageJs(injectPageJsContent);
      }
    })();

    return () => {
      isSync = false;

      clearCurrentBrowserSv();
    };
  }, [tabId]);

  const onCloseBrowserOptionModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const onLoadProgress = ({ nativeEvent: { progress } }: WebViewProgressEvent) => {
    setProgressNumber(progress);
  };

  const renderBrowserTabBar = (button: BrowserActionButtonType) => {
    if (!button.icon) {
      if (button.key === 'tabs') {
        return (
          <TouchableOpacity
            key={button.key}
            onPress={button.onPress}
            style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <View style={tabButtonStyle}>
              <Text style={{ color: ColorMap.light, ...FontSize0, ...FontMedium, lineHeight: 16 }}>{tabsNumber}</Text>
            </View>
          </TouchableOpacity>
        );
      }

      return null;
    }

    return (
      <IconButton
        key={button.key}
        disabled={button.isDisabled}
        color={(button.isDisabled && ColorMap.disabled) || undefined}
        icon={button.icon}
        onPress={button.onPress}
        size={24}
      />
    );
  };

  useImperativeHandle(ref, () => ({
    goToSite: (siteInfo: SiteInfo) => {
      if (!initWebViewSource) {
        if (siteUrl.current !== siteInfo.url) {
          updateTab({ id: tabId, url: siteInfo.url });
        }
        updateSiteInfo(siteInfo);
        setInitWebViewSource(siteInfo.url);
      } else {
        if (siteUrl.current !== siteInfo.url) {
          updateTab({ id: tabId, url: siteInfo.url });
          updateSiteInfo(siteInfo);
          webviewRef.current?.injectJavaScript(`(function(){window.location.href = '${siteInfo.url}' })()`);
        }
      }
    },
  }));

  return (
    <ScreenContainer backgroundColor={ColorMap.dark2}>
      <>
        <View style={headerWrapperStyle}>
          <View style={{ alignItems: 'center' }}>
            {hostname && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <LockIcon size={12} color={isUrlSecure ? ColorMap.primary : ColorMap.disabled} weight={'bold'} />
                  <Text numberOfLines={1} style={hostNameTextStyle}>
                    {hostname}
                  </Text>
                </View>
                <Text numberOfLines={1} style={nameSiteTextStyle}>
                  {siteName.current || siteUrl.current}
                </Text>
              </>
            )}
          </View>

          <View style={headerLeftSideStyle}>
            <AccountSettingButton navigation={navigation} />
          </View>

          <View style={headerRightSideStyle}>
            <IconButton icon={HouseSimple} onPress={goBack} />
          </View>
        </View>
        <View style={{ flex: 1, position: 'relative' }}>
          {isWebviewReady ? (
            <WebView
              ref={webviewRef}
              originWhitelist={['*']}
              source={{ uri: initWebViewSource }}
              injectedJavaScriptBeforeContentLoaded={injectedPageJs}
              injectedJavaScript={getJsInjectContent()}
              onLoadStart={onLoadStart}
              onLoad={onLoad}
              onLoadProgress={onLoadProgress}
              onMessage={onWebviewMessage}
              javaScriptEnabled={true}
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              allowFileAccessFromFileURLs={true}
              domStorageEnabled={true}
            />
          ) : (
            <EmptyListPlaceholder icon={GlobeSimple} title={i18n.common.emptyBrowserMessage} />
          )}

          {isShowPhishingWarning && <PhishingBlockerLayer />}
          {progressNumber !== 1 && (
            <View style={progressBarStyle}>
              <ProgressBar
                progress={progressNumber}
                width={null}
                color={ColorMap.primary}
                height={3}
                borderRadius={0}
                borderWidth={0}
                useNativeDriver
              />
            </View>
          )}
        </View>

        <View style={bottomButtonAreaStyle}>{bottomButtonList.map(button => renderBrowserTabBar(button))}</View>

        <BrowserOptionModal
          ref={browserOptionModalRef}
          visibleModal={modalVisible}
          onClose={onCloseBrowserOptionModal}
        />
      </>
    </ScreenContainer>
  );
};

export const BrowserTab = forwardRef(Component);
