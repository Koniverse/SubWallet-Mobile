import React, { useContext, useEffect, useRef, useState } from 'react';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { Alert, NativeSyntheticEvent, Platform, StyleProp, Text, View } from 'react-native';
import { AccountSettingButton } from 'components/AccountSettingButton';
import { useNavigation } from '@react-navigation/native';
import { BrowserTabProps, RootNavigationProps } from 'types/routes';
import {
  ArrowClockwise,
  CaretLeft,
  CaretRight,
  DotsThree,
  HouseSimple,
  IconProps,
  LockSimple,
  LockSimpleOpen,
  MagnifyingGlass,
  X,
} from 'phosphor-react-native';
import { IconButton } from 'components/IconButton';
import { centerStyle, FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { EmptyListPlaceholder } from 'screens/Home/Browser/EmptyListPlaceholder';
import { WebRunnerContext } from 'providers/contexts';
import WebView from 'react-native-webview';
import { WebViewMessage, WebViewNavigation, WebViewNavigationEvent } from 'react-native-webview/lib/WebViewTypes';
import { MESSAGE_ORIGIN_PAGE } from '@subwallet/extension-base/defaults';
import * as RNFS from 'react-native-fs';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { isAccountAll } from '@subwallet/extension-koni-base/utils';
import { approveAuthRequestV2 } from '../../../messaging';
import { DEVICE } from '../../../constant';
import { BrowserService } from 'screens/Home/Browser/BrowserService';
import { BrowserOptionModal } from 'screens/Home/Browser/BrowserOptionModal';

const browserTabHeaderWrapperStyle: StyleProp<any> = {
  flexDirection: 'row',
  backgroundColor: ColorMap.dark2,
  paddingBottom: 12,
  width: '100%',
  alignItems: 'center',
  paddingLeft: 16,
  paddingRight: 4,
};

type BrowserActionButtonType = {
  key: string;
  icon: (iconProps: IconProps) => JSX.Element;
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
    // todo: make this work on IOS
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
};

const hostNameTextStyle: StyleProp<any> = {
  paddingLeft: 4,
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
};

const bottomButtonAreaStyle: StyleProp<any> = {
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  backgroundColor: ColorMap.dark1,
  borderTopColor: ColorMap.dark2,
  borderTopWidth: 1,
  paddingVertical: 12,
};

export const BrowserTab = ({
  route: {
    params: { url: propUrl, name },
  },
}: BrowserTabProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [webViewSource, setWebViewSource] = useState(propUrl);
  const authorizeRequest = useSelector((state: RootState) => state.confirmation.details.authorizeRequest);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const { eventEmitter } = useContext(WebRunnerContext);
  const [{ canGoBack, canGoForward }, setNavigationInfo] = useState<NavigationInfo>({
    canGoBack: false,
    canGoForward: false,
  });
  const [injectedPageJs, setInjectedPageJs] = useState<string | null>(null);
  const webviewRef = useRef<WebView>(null);
  const browserSv = useRef<BrowserService | null>(null);
  const url = useRef(webViewSource);
  const title = useRef('');
  const address = (url.current || webViewSource).split('://')[1].split('/')[0];
  const hostname = address.split(':')[0];
  const isUrlSecure = (url.current || webViewSource).startsWith('https://');
  const LockIcon = isUrlSecure ? LockSimple : LockSimpleOpen;

  const changeUrl = (nativeEvent: WebViewNavigation) => {
    url.current = nativeEvent.url;
    title.current = nativeEvent.title;
  };

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
          // todo: handle phishing site here
          console.log('_____THIS IS PHISHING SITE_____');
        },
      });
    }
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

  const onLoadStart = async ({ nativeEvent }: WebViewNavigationEvent) => {
    if (nativeEvent.url !== url.current && nativeEvent.loading) {
      setNavigationInfo({
        canGoBack: nativeEvent.canGoBack,
        // currently the method goForward() of react webview does not work on Android
        // todo: find a way to overcome this issue
        canGoForward: DEVICE.isAndroid ? false : nativeEvent.canGoForward,
      });
    }

    changeUrl(nativeEvent);
    // clear the current service and init the new one
    clearCurrentBrowserSv();
    initBrowserSv(nativeEvent);
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
      key: 'reload',
      icon: ArrowClockwise,
      onPress: () => {
        const { current } = webviewRef;
        current && current.reload && current.reload();
      },
    },
    {
      key: 'home',
      icon: HouseSimple,
      onPress: () => {},
    },
    {
      key: 'more',
      icon: DotsThree,
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
  }, []);

  useEffect(() => {
    if (url.current !== propUrl) {
      setWebViewSource(propUrl);
    }
  }, [propUrl]);

  useEffect(() => {
    authorizeRequest &&
      Object.keys(authorizeRequest).forEach(authId => {
        Alert.alert('Request Access', `For ${authorizeRequest[authId].url}`, [
          {
            text: 'Accept',
            onPress: () => {
              const accountNames = accounts.filter(a => !isAccountAll(a.address)).map(a => a.address);

              approveAuthRequestV2(authId, accountNames)
                .then(rs => {
                  console.log('---- approveAuthRequestV2 rs----', rs);
                })
                .catch((error: Error) => console.log('---- approveAuthRequestV2 error----', error));
            },
          },
          {
            text: 'OK',
          },
        ]);
      });
  }, [authorizeRequest, accounts]);

  return (
    <ScreenContainer>
      <>
        <View style={browserTabHeaderWrapperStyle}>
          <AccountSettingButton navigation={navigation} />

          <View style={centerStyle}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <LockIcon size={12} color={isUrlSecure ? ColorMap.primary : ColorMap.disabled} weight={'bold'} />
              <Text style={hostNameTextStyle}>{hostname}</Text>
            </View>
            <Text style={nameSiteTextStyle}>{title.current || name}</Text>
          </View>

          <IconButton
            icon={X}
            onPress={() => {
              navigation.canGoBack() && navigation.goBack();
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          {injectedPageJs ? (
            <WebView
              ref={webviewRef}
              originWhitelist={['*']}
              source={{ uri: webViewSource }}
              injectedJavaScriptBeforeContentLoaded={injectedPageJs}
              injectedJavaScript={getJsInjectContent(true)}
              onLoadStart={onLoadStart}
              onMessage={onWebviewMessage}
              javaScriptEnabled={true}
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              allowFileAccessFromFileURLs={true}
              domStorageEnabled={true}
            />
          ) : (
            <EmptyListPlaceholder />
          )}
        </View>

        <View style={bottomButtonAreaStyle}>
          {bottomButtonList.map(button => (
            <IconButton
              key={button.key}
              disabled={button.isDisabled}
              color={(button.isDisabled && ColorMap.disabled) || undefined}
              icon={button.icon}
              onPress={button.onPress}
              size={24}
            />
          ))}
        </View>

        <BrowserOptionModal visibleModal={modalVisible} onChangeModalVisible={() => setModalVisible(false)} />
      </>
    </ScreenContainer>
  );
};
