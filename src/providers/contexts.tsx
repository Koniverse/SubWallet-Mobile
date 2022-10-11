import React, { RefObject } from 'react';
import WebView from 'react-native-webview';
import { SWTheme, THEME_PRESET } from 'styles/themes';
import { QrCallBackMap, QrValue } from 'types/QRScanner';
import EventEmitter from 'eventemitter3';
import { DelayBackgroundService } from 'types/background';

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
  eventEmitter?: EventEmitter;
  clearBackgroundServiceTimeout: (service: DelayBackgroundService) => void;
  setBackgroundServiceTimeout: (service: DelayBackgroundService, timeout: NodeJS.Timeout) => void;
}

const WebRunnerContext = React.createContext<WebviewElement>({
  webState: {},
  clearBackgroundServiceTimeout: () => {},
  setBackgroundServiceTimeout: () => {},
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
