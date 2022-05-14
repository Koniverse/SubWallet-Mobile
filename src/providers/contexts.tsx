import React, {MutableRefObject} from 'react';
import WebView from 'react-native-webview';
import {SWTheme, THEME_PRESET} from '../themes';

const ThemeContext = React.createContext<SWTheme>(THEME_PRESET.dark);

const WebViewContext = React.createContext<{
  viewRef?: MutableRefObject<WebView | undefined>;
  status?: string;
}>({});

export {ThemeContext, WebViewContext};
