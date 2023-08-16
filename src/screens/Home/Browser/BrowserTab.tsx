import React, { ForwardedRef, forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { Alert, Linking, NativeSyntheticEvent, Platform, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { AccountSettingButton } from 'components/AccountSettingButton';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import {
  ArrowClockwise,
  CaretLeft,
  CaretRight,
  DotsThree,
  GlobeSimple,
  House,
  IconProps,
  X,
} from 'phosphor-react-native';
import { WebRunnerContext } from 'providers/contexts';
import WebView from 'react-native-webview';
import {
  WebViewMessage,
  WebViewNavigation,
  WebViewNavigationEvent,
  WebViewProgressEvent,
} from 'react-native-webview/lib/WebViewTypes';
import * as RNFS from 'react-native-fs';
import { DEVICE } from 'constants/index';
import { BrowserService } from 'screens/Home/Browser/BrowserService';
import { BrowserOptionModal, BrowserOptionModalRef } from 'screens/Home/Browser/BrowserOptionModal';
import { addToHistory, updateLatestItemInHistory, updateTab, updateTabScreenshot } from 'stores/updater';
import { getHostName, searchDomain } from 'utils/browser';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { SiteInfo } from 'stores/types';
import { Bar as ProgressBar } from 'react-native-progress';
import { captureScreen } from 'react-native-view-shot';
import { EmptyList } from 'components/EmptyList';
import { BridgeScript, DAppScript, ConnectToNovaScript } from 'screens/Home/Browser/BrowserScripts';
import { NoInternetScreen } from 'components/NoInternetScreen';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles/BrowserTab';
import TabIcon from 'screens/Home/Browser/Shared/TabIcon';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import urlParse from 'url-parse';
import { connectWalletConnect } from 'utils/walletConnect';
import { useToast } from 'react-native-toast-notifications';

export interface BrowserTabRef {
  goToSite: (siteInfo: SiteInfo) => void;
}

type Props = {
  tabId: string;
  onOpenBrowserTabs: () => void;
  connectionTrigger: React.ReactNode;
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

const InjectPageJsScript: InjectPageJsScriptType = {
  content: null,

  async init() {
    let pageJsContent;
    if (Platform.OS === 'ios') {
      pageJsContent = await RNFS.readFile(`${RNFS.MainBundlePath}/PageJs.bundle/page.js`, 'ascii');
    } else {
      pageJsContent = await RNFS.readFileAssets('PageJs.bundle/page.js', 'ascii');
    }

    this.content = pageJsContent;

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

//todo: Update better style
const PhishingBlockerLayer = () => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  return (
    <View style={stylesheet.phishingBlockerLayer}>
      <Warning isDanger title={i18n.title.phishingDetected} message={i18n.warningMessage.phishingMessage} />
    </View>
  );
};

const Component = ({ tabId, onOpenBrowserTabs, connectionTrigger }: Props, ref: ForwardedRef<BrowserTabRef>) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const navigation = useNavigation<RootNavigationProps>();
  const historyItems = useSelector((state: RootState) => state.browser.history);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [initWebViewSource, setInitWebViewSource] = useState<string | null>(null);
  const [progressNumber, setProgressNumber] = useState<number>(0);
  const { eventEmitter } = useContext(WebRunnerContext);
  const [{ canGoBack, canGoForward }, setNavigationInfo] = useState<NavigationInfo>({
    canGoBack: false,
    canGoForward: false,
  });
  const [injectedScripts, setInjectedScripts] = useState<string | null>(null);
  const [isShowPhishingWarning, setIsShowPhishingWarning] = useState<boolean>(false);
  const webviewRef = useRef<WebView>(null);
  const browserSv = useRef<BrowserService | null>(null);
  const siteUrl = useRef<string | null>(null);
  const siteName = useRef('');
  const browserOptionModalRef = useRef<BrowserOptionModalRef>(null);
  const hostname = siteUrl.current ? getHostName(siteUrl.current) : null;
  const isNetConnected = useContext(WebRunnerContext).isNetConnected;
  const isWebviewReady = !!(initWebViewSource && injectedScripts);
  const toast = useToast();

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

      if (id === '-2') {
        console.log('### Browser Tab console', content);
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

      setTimeout(() => {
        if (getHostName(nativeEvent.url) !== searchDomain) {
          const isHistoryItemExisted = historyItems.length > 0 && historyItems[0].url !== nativeEvent.url;
          if (isHistoryItemExisted) {
            updateLatestItemInHistory({
              url: nativeEvent.url,
              name: nativeEvent.title || nativeEvent.url,
            });
          }
        }
      }, 800);
      updateBrowserOptionModalRef(nativeEvent);
    }
  };

  const onLoadStart = ({ nativeEvent }: WebViewNavigationEvent) => {
    if (nativeEvent.url !== siteUrl.current) {
      updateTab({ id: tabId, url: nativeEvent.url });
      updateSiteInfo({ url: nativeEvent.url, name: nativeEvent.title });
    }

    updateNavigationInfo(nativeEvent);

    if (getHostName(nativeEvent.url) !== searchDomain) {
      const isNotDuplicated =
        historyItems.length === 0 || (historyItems.length > 0 && historyItems[0].url !== nativeEvent.url);
      console.log('isNotDuplicated', isNotDuplicated, historyItems[0], nativeEvent.url);
      if (isNotDuplicated) {
        addToHistory({
          url: nativeEvent.url,
          name: nativeEvent.title || nativeEvent.url,
        });
      }
    }

    updateBrowserOptionModalRef(nativeEvent);

    setIsShowPhishingWarning(false);

    // clear the current service and init the new one
    clearCurrentBrowserSv();
    initBrowserSv(nativeEvent);
  };

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.navigate('Home', { screen: 'Browser' });
    } else {
      navigation.replace('Home', { screen: 'Browser' });
    }
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
      key: 'home',
      icon: House,
      onPress: goBack,
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
        const injectScripts =
          getJsInjectContent(true) + BridgeScript + injectPageJsContent + ConnectToNovaScript + DAppScript;

        setInjectedScripts(injectScripts);
      }
    })();

    return () => {
      isSync = false;

      clearCurrentBrowserSv();
    };
  }, [tabId]);

  const onLoadProgress = ({ nativeEvent: { progress } }: WebViewProgressEvent) => {
    setProgressNumber(progress);
  };

  const renderBrowserTabBar = (button: BrowserActionButtonType) => {
    if (!button.icon) {
      if (button.key === 'tabs') {
        return <TabIcon onPress={button.onPress} />;
      }

      return null;
    }

    return (
      <Button
        type={'ghost'}
        key={button.key}
        size={'sm'}
        disabled={button.isDisabled}
        icon={
          <Icon
            phosphorIcon={button.icon}
            weight={'bold'}
            iconColor={button.isDisabled ? theme.colorTextLight4 : theme.colorTextLight1}
            size={'md'}
          />
        }
        onPress={button.onPress}
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

  const onShouldStartLoadWithRequest = ({ url }: WebViewNavigation) => {
    if (
      url.startsWith('tel:') ||
      url.startsWith('mailto:') ||
      url.startsWith('maps:') ||
      url.startsWith('geo:') ||
      url.startsWith('sms:')
    ) {
      Linking.openURL(url).catch(er => {
        Alert.alert('Failed to open Link: ' + er.message);
      });
      return false;
    }
    const urlParsed = new urlParse(url);

    if (url.startsWith('wc:')) {
      if (urlParsed.query.startsWith('?requestId')) {
        return false;
      }
      connectWalletConnect(url, toast);
      return false;
    }

    if (urlParsed.href.includes('wc?uri=wc')) {
      Linking.canOpenURL(url)
        .then(supported => {
          if (supported) {
            return Linking.openURL(url);
          }
          console.warn(`Can't open url: ${url}`);
          return null;
        })
        .catch(e => {
          console.warn(`Error opening URL: ${e}`);
        });
      return false;
    }

    if (urlParsed.href.startsWith('itms-appss://')) {
      return false;
    }

    return true;
  };

  const onOutOfMemmories = () => {
    webviewRef.current?.reload();
  };

  return (
    <ScreenContainer backgroundColor={theme.colorBgDefault}>
      <View style={stylesheet.header}>
        <AccountSettingButton navigation={navigation} style={stylesheet.avatarSelector} />

        <View style={stylesheet.siteInfoWrapper}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('BrowserSearch');
            }}
            style={stylesheet.siteInfoTouchableArea}>
            <Typography.Text ellipsis style={stylesheet.siteInfoName}>
              {hostname || ''}
            </Typography.Text>
          </TouchableOpacity>
          {connectionTrigger}
          <Button
            type={'ghost'}
            size={'xs'}
            style={stylesheet.reloadButton}
            icon={<Icon phosphorIcon={ArrowClockwise} weight={'bold'} iconColor={theme.colorTextLight3} size={'sm'} />}
            onPress={() => {
              const { current } = webviewRef;
              current && current.reload && current.reload();
            }}
          />
        </View>

        <Button
          type={'ghost'}
          size={'xs'}
          style={stylesheet.closeButton}
          icon={<Icon phosphorIcon={X} weight={'bold'} iconColor={theme.colorTextLight1} size={'md'} />}
          onPress={goBack}
        />
      </View>
      <View style={stylesheet.webViewWrapper}>
        {isNetConnected ? (
          isWebviewReady ? (
            <WebView
              style={stylesheet.colorBlack}
              ref={webviewRef}
              originWhitelist={['*']}
              source={{ uri: initWebViewSource }}
              injectedJavaScriptBeforeContentLoaded={injectedScripts}
              onLoadStart={onLoadStart}
              onLoad={onLoad}
              onLoadProgress={onLoadProgress}
              onMessage={onWebviewMessage}
              onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
              onContentProcessDidTerminate={onOutOfMemmories}
              allowFileAccess
              allowsInlineMediaPlayback
              allowUniversalAccessFromFileURLs
              allowFileAccessFromFileURLs
              domStorageEnabled
              javaScriptEnabled
            />
          ) : (
            <EmptyList icon={GlobeSimple} title={i18n.common.emptyBrowserMessage} />
          )
        ) : (
          <NoInternetScreen />
        )}

        {isShowPhishingWarning && <PhishingBlockerLayer />}
        {progressNumber !== 1 && (
          <View style={stylesheet.progressBar}>
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

      <View style={stylesheet.footer}>{bottomButtonList.map(renderBrowserTabBar)}</View>

      <SafeAreaView style={stylesheet.footerAfter} />

      <BrowserOptionModal ref={browserOptionModalRef} visibleModal={modalVisible} setVisibleModal={setModalVisible} />
    </ScreenContainer>
  );
};

export const BrowserTab = forwardRef(Component);
