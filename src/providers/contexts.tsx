import React, {MutableRefObject} from 'react';
import WebView from 'react-native-webview';

const WebViewContext = React.createContext<{
  viewRef?: MutableRefObject<WebView | undefined>;
  status?: string;
}>({});

export {WebViewContext};
