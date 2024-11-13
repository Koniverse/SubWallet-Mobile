import type {
  MessageTypes,
  MessageTypesWithNoSubscriptions,
  MessageTypesWithNullRequest,
  MessageTypesWithSubscriptions,
  RequestSignatures,
  RequestTypes,
  ResponseTypes,
  SubscriptionMessageTypes,
} from '@subwallet/extension-base/background/types';
import { getId } from '@subwallet/extension-base/utils/getId';
import { RefObject } from 'react';
import WebView from 'react-native-webview';
import EventEmitter from 'eventemitter3';
import { WebRunnerStatus } from 'providers/contexts';
import { WebviewError, WebviewNotReadyError, WebviewResponseError } from '../errors/WebViewErrors';
import { Message } from '@subwallet/extension-base/types';
import { needBackup, triggerBackup } from 'utils/storage';

interface Handler {
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  subscriber?: (data: any) => void;
}

type Handlers = Record<string, Handler>;
type MessageType = 'PRI' | 'PUB' | 'EVM' | 'UNKNOWN';
const handlers: Handlers = {};
const handlerTypeMap: Record<string, MessageType> = {};
const handlerMessageMap: Record<string, keyof RequestSignatures> = {};

let webviewRef: RefObject<WebView | undefined>;
let webviewEvents: EventEmitter;
let status: WebRunnerStatus = 'init';

// Support restart web-runner
// @ts-ignore
const restartHandlers: Record<string, { id; message; request; origin }> = {};

export async function cancelSubscription(request: string): Promise<boolean> {
  return sendMessage('pri(subscription.cancel)', request);
}

export async function clearWebRunnerHandler(id: string): Promise<boolean> {
  const handlerTypeMapValue = handlerTypeMap[id];

  if (!handlerTypeMapValue) {
    return true;
  }

  delete handlers[id];
  delete handlerTypeMap[id];
  delete handlerMessageMap[id];

  if (handlerTypeMapValue) {
    if (['PRI', 'PUB', 'EVM'].includes(handlerTypeMapValue)) {
      return cancelSubscription(id);
    }
  }

  return true;
}

export function getMessageType(message: string): MessageType {
  if (message.startsWith('pri(')) {
    return 'PRI';
  } else if (message.startsWith('pub(')) {
    return 'PUB';
  } else if (message.startsWith('evm(')) {
    return 'EVM';
  }

  return 'UNKNOWN';
}

function isDappHandle(id: string): boolean {
  if (!handlerTypeMap[id]) {
    return false;
  }

  return handlerTypeMap[id] === 'PUB' || handlerTypeMap[id] === 'EVM';
}

export const setupWebview = (viewRef: RefObject<WebView | undefined>, eventEmitter: EventEmitter) => {
  webviewRef = viewRef;
  // Subscribe in the first time only
  if (!webviewEvents) {
    eventEmitter.on('update-status', stt => {
      status = stt;
    });
    eventEmitter.on('reloading', () => {
      console.debug(`### Clean ${Object.keys(handlers).length} handlers`);
      Object.entries(handlers).forEach(([id, handler]) => {
        handler.reject(new WebviewNotReadyError('Webview is not ready'));
        delete handlers[id];
        delete handlerTypeMap[id];
        delete handlerMessageMap[id];
      });
    });
  }
  webviewEvents = eventEmitter;
};

export const listenMessage = (
  data: Message['data'],
  eventEmitter?: EventEmitter,
  handleUnknown?: (data: Message['data']) => boolean,
): void => {
  const handlerId = data.id;

  if (isDappHandle(handlerId)) {
    if (data.response !== undefined || data.subscription !== undefined || data.error !== undefined) {
      eventEmitter?.emit(handlerId, JSON.stringify(data));
    }
    return;
  }

  const handler = handlers[handlerId];

  if (!handler) {
    let unknownHandled = false;
    if (handleUnknown) {
      unknownHandled = handleUnknown(data);
    }

    if (!unknownHandled) {
      console.warn(`Unknown response: ${JSON.stringify(handlerId)}`);
    }

    return;
  }

  if (!handler.subscriber) {
    delete handlers[handlerId];
    delete handlerTypeMap[handlerId];
    delete handlerMessageMap[handlerId];
  }

  if (data.subscription) {
    (handler.subscriber as Function)(data.subscription);
  } else if (data.error) {
    handler.reject(new WebviewResponseError(data.error));
  } else {
    handler.resolve(data.response);
  }
};

// @ts-ignore
export const postMessage = ({ id, message, request, origin }, supportRestart = false) => {
  handlerTypeMap[id] = getMessageType(message);
  handlerMessageMap[id] = message;

  if (supportRestart) {
    restartHandlers[id] = { id, message, request, origin };
  }

  const _post = () => {
    const injection = 'window.postMessage(' + JSON.stringify({ id, message, request, origin }) + ')';
    webviewRef.current?.injectJavaScript(injection);

    if (needBackup(message)) {
      triggerBackup(`*** Backup storage after ${message}`);
    }
  };

  if (!webviewRef || !webviewEvents) {
    throw new WebviewError('Webview is not init');
  }

  if (status === 'crypto_ready' || (message.startsWith('mobile') && status === 'require_restore')) {
    _post();
  } else {
    const eventHandle = (stt: string) => {
      if (stt === 'crypto_ready') {
        _post();
        webviewEvents.off('update-status', eventHandle);
      }
    };

    webviewEvents.on('update-status', eventHandle);
  }
};

export function resetHandlerMaps(): void {
  Object.keys(handlerTypeMap).forEach(id => {
    delete handlers[id];
    delete handlerTypeMap[id];
    delete handlerMessageMap[id];
    delete restartHandlers[id];
  });
}

export function restartAllHandlers(): void {
  const canRestartList = Object.values(restartHandlers).filter(h => !!handlerTypeMap[h.id]);
  const removeList = Object.values(restartHandlers).filter(h => !handlerTypeMap[h.id]);

  removeList.forEach(({ id }) => {
    delete handlers[id];
    delete handlerTypeMap[id];
    delete handlerMessageMap[id];
    delete restartHandlers[id];
  });

  const numberHandlers = Object.keys(handlerTypeMap).length;
  console.log(`Restart ${canRestartList.length}/${numberHandlers} handlers`);

  canRestartList.forEach(({ id, message, request, origin }) => {
    postMessage({ id, message, request, origin });
  });
}

export function getMessageByHandleId(id: string): string | undefined {
  return handlerMessageMap[id];
}

function isSubscription(key: keyof RequestSignatures): boolean {
  const tuple = ({} as RequestSignatures)[key];

  return Array.isArray(tuple) && tuple.length === 3;
}

export function sendMessage<TMessageType extends MessageTypesWithNullRequest>(
  message: TMessageType,
): Promise<ResponseTypes[TMessageType]>;
export function sendMessage<TMessageType extends MessageTypesWithNoSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
): Promise<ResponseTypes[TMessageType]>;
export function sendMessage<TMessageType extends MessageTypesWithSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
  subscriber: (data: SubscriptionMessageTypes[TMessageType]) => void,
  handlerId?: string,
): Promise<ResponseTypes[TMessageType]>;
export function sendMessage<TMessageType extends MessageTypes>(
  message: TMessageType,
  request?: RequestTypes[TMessageType],
  subscriber?: (data: unknown) => void,
  handlerId?: string,
): Promise<ResponseTypes[TMessageType]> {
  return new Promise((resolve, reject): void => {
    const id = handlerId ? handlerId : getId();

    handlers[id] = { reject, resolve, subscriber };

    postMessage({ id, message, request: request || {}, origin: undefined }, isSubscription(message));
  });
}

export function lazySendMessage<TMessageType extends MessageTypesWithNoSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
  callback: (data: ResponseTypes[TMessageType]) => void,
): { promise: Promise<ResponseTypes[TMessageType]>; start: () => void } {
  const id = getId();
  const handlePromise = new Promise((resolve, reject): void => {
    handlers[id] = { reject, resolve };
  });

  const rs = {
    promise: handlePromise as Promise<ResponseTypes[TMessageType]>,
    start: () => {
      postMessage({ id, message, request: request || {}, origin: undefined });
    },
  };

  rs.promise
    .then(data => {
      callback(data);
    })
    .catch(console.error);

  return rs;
}

export function lazySubscribeMessage<TMessageType extends MessageTypesWithSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
  callback: (data: ResponseTypes[TMessageType]) => void,
  subscriber: (data: SubscriptionMessageTypes[TMessageType]) => void,
): { promise: Promise<ResponseTypes[TMessageType]>; start: () => void; unsub: () => void } {
  const id = getId();
  let cancel = false;
  const handlePromise = new Promise((resolve, reject): void => {
    handlers[id] = { reject, resolve, subscriber };
  });

  const rs = {
    promise: handlePromise as Promise<ResponseTypes[TMessageType]>,
    start: () => {
      postMessage({ id, message, request: request || {}, origin: undefined }, true);
    },
    unsub: () => {
      const handler = handlers[id];

      cancel = true;

      if (handler) {
        delete handler.subscriber;
        handler.resolve(null);
      }
    },
  };

  rs.promise
    .then(data => {
      !cancel && callback(data);
    })
    .catch(console.error);

  return rs;
}

export function subscribeMessage<TMessageType extends MessageTypesWithSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
  callback: (data: ResponseTypes[TMessageType]) => void,
  subscriber: (data: SubscriptionMessageTypes[TMessageType]) => void,
): { promise: Promise<ResponseTypes[TMessageType]>; unsub: () => void } {
  const lazyItem = lazySubscribeMessage(message, request, callback, subscriber);

  lazyItem.start();

  return {
    promise: lazyItem.promise,
    unsub: lazyItem.unsub,
  };
}
