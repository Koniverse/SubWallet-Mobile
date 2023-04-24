import React from 'react';
import WebView from 'react-native-webview';
import EventEmitter from 'eventemitter3';
import { clearWebRunnerHandler, postMessage } from 'messaging/index';
import { MESSAGE_ORIGIN_CONTENT } from '@subwallet/extension-base/defaults';
import { TransportRequestMessage } from '@subwallet/extension-base/background/types';
import { getId } from '@subwallet/extension-base/utils/getId';
import { Message } from '@subwallet/extension-base/types';

export type BrowserServiceArgs = {
  browserWebviewRef: React.RefObject<WebView<{}>>;
  webRunnerEventEmitter: EventEmitter;
  url: string;
  onHandlePhishing: () => void;
};

type PhishingHandleType = {
  id: string;
  onHandlePhishing: BrowserServiceArgs['onHandlePhishing'];
};

export class BrowserService {
  private webRunnerEventEmitter: EventEmitter<string | symbol, any>;
  private browserWebviewRef: React.RefObject<WebView<{}>>;
  private handlerIds: string[];
  private readonly phishingHandle: PhishingHandleType;
  private isDisconnected: boolean;

  constructor({ webRunnerEventEmitter, browserWebviewRef, url, onHandlePhishing }: BrowserServiceArgs) {
    this.webRunnerEventEmitter = webRunnerEventEmitter;
    this.browserWebviewRef = browserWebviewRef;
    this.handlerIds = [];
    this.phishingHandle = {
      id: 'redirect-phishing-' + getId(),
      onHandlePhishing,
    };
    this.isDisconnected = false;
    this.checkPhishing(url);
  }

  private checkPhishing(origin: string) {
    const transportRequestMessage: TransportRequestMessage<'pub(phishing.redirectIfDenied)'> = {
      id: this.phishingHandle.id,
      message: 'pub(phishing.redirectIfDenied)',
      origin,
      request: null,
    };

    this.onMessage(transportRequestMessage);
  }

  // @ts-ignore
  onMessage({ id, message, request, origin }) {
    if (this.isDisconnected) {
      return;
    }

    this.handlerIds.push(id);

    this.webRunnerEventEmitter.on(id, dataString => {
      const { id: phishingHandleId, onHandlePhishing } = this.phishingHandle;
      const data = JSON.parse(dataString) as Message['data'];

      if (data.id === phishingHandleId) {
        if (data.response) {
          this.onDisconnect();
          onHandlePhishing();
        }
      } else {
        const injection = 'window.postMessage(' + JSON.stringify({ ...data, origin: MESSAGE_ORIGIN_CONTENT }) + ')';
        this.browserWebviewRef.current?.injectJavaScript(injection);
      }
    });

    postMessage({ id, message, request, origin });
  }

  onDisconnect() {
    if (this.isDisconnected) {
      return;
    }

    this.isDisconnected = true;
    this.handlerIds.forEach(id => {
      this.webRunnerEventEmitter.removeAllListeners(id);
      clearWebRunnerHandler(id);
    });
  }
}
