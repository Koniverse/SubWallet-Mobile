import React, { MutableRefObject } from 'react';
import WebView from 'react-native-webview';
import { SWTheme, THEME_PRESET } from 'styles/themes';
import { QrCallBackMap, QrValue } from 'types/QRScanner';

const ThemeContext = React.createContext<SWTheme>(THEME_PRESET.dark);

const WebViewContext = React.createContext<{
  viewRef?: MutableRefObject<WebView | undefined>;
  status?: string;
  url?: string;
  version?: string;
}>({});

const QrScannerContext = React.createContext<{
  value: QrValue;
  status: 'off' | 'scanning' | 'scanned';
  open: (options: QrCallBackMap) => void;
  onScanned: (value: QrValue) => void;
  onClosed: (value: QrValue) => void;
}>({
  value: undefined,
  status: 'off',
  open: () => {},
  onScanned: () => {},
  onClosed: () => {},
});

export { ThemeContext, WebViewContext, QrScannerContext };
