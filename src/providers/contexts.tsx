import React, { RefObject } from 'react';
import WebView from 'react-native-webview';
import { SWTheme, THEME_PRESET } from 'styles/themes';
import { QrCallBackMap, QrValue } from 'types/QRScanner';
import EventEmitter from 'eventemitter3';

const ThemeContext = React.createContext<SWTheme>(THEME_PRESET.dark);

export type WebRunnerStatus = 'init' | 'load' | 'reloading' | 'crypto_ready' | 'ping' | 'sleep';
export interface WebRunnerState {
  status?: WebRunnerStatus;
  url?: string;
  version?: string;
  userAgent?: string;
}
export interface WebviewElement {
  webRef?: RefObject<WebView | undefined>;
  reload?: () => void;
  webState: WebRunnerState;
  isReady?: boolean;
  isNetConnected?: boolean;
  eventEmitter?: EventEmitter;
}

const WebRunnerContext = React.createContext<WebviewElement>({
  webState: {},
});

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

export { ThemeContext, WebRunnerContext, QrScannerContext };
