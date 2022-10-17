import { MESSAGE_ORIGIN_PAGE } from '@subwallet/extension-base/defaults';

export const NovaScript = `
(function () {  
  class HandlersStore {
    _messageHandlers;

    constructor() {
      this._messageHandlers = new Map();
    }

    addHandler = (type, resolve, reject) => {
      this._messageHandlers.set(type, {
        resolve,
        reject,
      });
    };

    getHandler = type => {
      return this._messageHandlers.get(type);
    };
  }

  class WalletExtension {
    handlers;

    constructor() {
      this.handlers = new HandlersStore();

      window.walletExtension = {
        onAppResponse: this.onAppResponse.bind(this),
        onAppSubscription: this.onAppSubscription.bind(this),
        isNovaWallet: true,
      };
    }

    postResponse(data) {
      this._postMessage('${MESSAGE_ORIGIN_PAGE}', data);
    }

    _postMessage(origin, data) {
      window.postMessage({ ...data, origin }, '*');
    }

    onAppResponse(message, response, error) {
      const handler = this.handlers.getHandler(message);
      if (handler) {
        if (error) {
          handler.reject(error);
        } else {
          handler.resolve(response);
        }
      }
    }

    onAppSubscription(requestId, subscriptionString) {
      this.postResponse({ id: requestId, subscription: subscriptionString });
    }
  }

  (() => new WalletExtension())();
})();
`;

export const BridgeScript = `(function () {
  window.addEventListener('message', ({ data, source }) => {
    // only allow messages from our window, by the inject
    if (source !== window || data.origin !== '${MESSAGE_ORIGIN_PAGE}') {
      return;
    }
    window.ReactNativeWebView.postMessage(JSON.stringify({...data, origin: window.location.href}));
  });
})();`;

export const DAppScript = `(function () {
    window.ethereum = window.SubWallet;
    window.ethereum.isMetaMask = true;
    window.injectedWeb3['polkadot-js'] = window.injectedWeb3['subwallet-js'];
  })();`;
