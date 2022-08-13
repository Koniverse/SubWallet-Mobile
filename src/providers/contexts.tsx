import React, { RefObject } from 'react';
import WebView from 'react-native-webview';
import { SWTheme, THEME_PRESET } from 'styles/themes';
import { QrCallBackMap, QrValue } from 'types/QRScanner';
import EventEmitter from 'eventemitter3';

const ThemeContext = React.createContext<SWTheme>(THEME_PRESET.dark);

export type WebviewStatus = 'init' | 'load' | 'reloading' | 'crypto_ready';
export interface WebviewElement {
  viewRef?: RefObject<WebView | undefined>;
  status?: WebviewStatus;
  url?: string;
  version?: string;
  reload?: () => void;
  eventEmitter?: EventEmitter;
}
const WebViewContext = React.createContext<WebviewElement>({});

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
