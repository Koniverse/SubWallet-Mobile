import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { WebRunnerContext, WebRunnerState, WebRunnerStatus } from '../contexts';
import WebView from 'react-native-webview';
import { setupWebview } from 'messaging/index';
import { WebRunner } from 'providers/WebRunnerProvider/WebRunner';
import EventEmitter from 'eventemitter3';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';

interface WebRunnerProviderProps {
  children?: React.ReactNode;
  webRef?: MutableRefObject<WebView | undefined>;
}

const eventEmitter = new EventEmitter();
let lastIsReady = false;
let lastIsNetConnected = true;
export const WebRunnerProvider = ({ children }: WebRunnerProviderProps): React.ReactElement<WebRunnerProviderProps> => {
  const webRef = useRef<WebView>(null);
  const webStateRef = useRef<WebRunnerState>({
    status: 'init',
    version: 'unknown',
  });
  const [isReady, setIsReady] = useState(lastIsReady);
  const [isNetConnected, setIsNetConnected] = useState(lastIsNetConnected);

  useEffect(() => {
    setupWebview(webRef, eventEmitter);
  }, [webRef]);

  const reload = useCallback(() => {
    console.log('Reload web runner');
    eventEmitter.emit('update-status', 'reloading');
    webRef?.current?.reload();
  }, [webRef]);

  useEffect(() => {
    const listener = eventEmitter.on('update-status', (status: WebRunnerStatus) => {
      const _isReady = status === 'crypto_ready';
      if (lastIsReady !== _isReady) {
        setIsReady(_isReady);
        lastIsReady = _isReady;
      }
    });

    const netUnsubscribe = NetInfo.addEventListener(netState => {
      const isConnected = netState.isInternetReachable;

      if (isConnected !== null) {
        setIsNetConnected(isConnected);

        if (AppState.currentState === 'active') {
          if (!lastIsNetConnected && isConnected) {
            reload();
          }
        }

        lastIsNetConnected = isConnected;
      }
    });

    return () => {
      listener.removeListener('update-status');
      netUnsubscribe();
    };
  }, [reload]);

  return (
    <WebRunnerContext.Provider
      value={{
        webState: webStateRef.current,
        webRef,
        isReady,
        eventEmitter,
        reload,
        isNetConnected,
      }}>
      <WebRunner webRunnerRef={webRef} webRunnerStateRef={webStateRef} webRunnerEventEmitter={eventEmitter} />
      {children}
    </WebRunnerContext.Provider>
  );
};
