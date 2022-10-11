import React, { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { WebRunnerContext, WebRunnerState, WebRunnerStatus } from '../contexts';
import WebView from 'react-native-webview';
import { setupWebview } from '../../messaging';
import { WebRunner } from 'providers/WebRunnerProvider/WebRunner';
import EventEmitter from 'eventemitter3';
import { DelayBackgroundService } from 'types/background';

interface WebRunnerProviderProps {
  children?: React.ReactNode;
  webRef?: MutableRefObject<WebView | undefined>;
}

const backgroundServiceTimeoutMap: Record<DelayBackgroundService, NodeJS.Timeout | undefined> = {
  nft: undefined,
  staking: undefined,
  crowdloan: undefined,
};

function clearBackgroundServiceTimeout(service: DelayBackgroundService) {
  clearTimeout(backgroundServiceTimeoutMap[service]);
}

function setBackgroundServiceTimeout(service: DelayBackgroundService, timeout: NodeJS.Timeout) {
  backgroundServiceTimeoutMap[service] = timeout;
}

const eventEmitter = new EventEmitter();
let lastIsReady = false;
export const WebRunnerProvider = ({ children }: WebRunnerProviderProps): React.ReactElement<WebRunnerProviderProps> => {
  const webRef = useRef<WebView>(null);
  const webStateRef = useRef<WebRunnerState>({
    status: 'init',
    version: 'unknown',
  });
  const [isReady, setIsReady] = useState(lastIsReady);

  useEffect(() => {
    setupWebview(webRef, eventEmitter);
  }, [webRef]);

  useEffect(() => {
    const listener = eventEmitter.on('update-status', (status: WebRunnerStatus) => {
      const _isReady = status === 'crypto_ready';
      if (lastIsReady !== _isReady) {
        setIsReady(_isReady);
        lastIsReady = _isReady;
      }
    });
    return () => {
      listener.removeListener('update-status');
    };
  }, []);

  const reload = useCallback(() => {
    console.log('Reload web runner');
    webRef?.current?.reload();
  }, [webRef]);

  return (
    <WebRunnerContext.Provider
      value={{
        webState: webStateRef.current,
        webRef,
        isReady,
        eventEmitter,
        reload,
        clearBackgroundServiceTimeout,
        setBackgroundServiceTimeout,
      }}>
      <WebRunner
        webRunnerRef={webRef}
        webRunnerStateRef={webStateRef}
        webRunnerEventEmitter={eventEmitter}
        clearBackgroundServiceTimeout={clearBackgroundServiceTimeout}
        setBackgroundServiceTimeout={setBackgroundServiceTimeout}
      />
      {children}
    </WebRunnerContext.Provider>
  );
};
