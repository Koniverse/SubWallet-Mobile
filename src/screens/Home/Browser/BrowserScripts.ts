import { MESSAGE_ORIGIN_PAGE } from '@subwallet/extension-base/defaults';
import { getId } from '@subwallet/extension-base/utils/getId';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { getHostName } from 'utils/browser';

export const ConnectToNovaScript = `
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

const autoTriggerSubstrateHosts: string[] = [];
const autoTriggerEthereumHosts: string[] = [];

predefinedDApps.dapps.forEach(s => {
  if (s.isSupportSubstrateAccount) {
    autoTriggerSubstrateHosts.push(getHostName(s.url));
  }

  if (s.isSupportEthereumAccount) {
    autoTriggerEthereumHosts.push(getHostName(s.url));
  }
});

export const DAppScript = `(function () {
  if (window.SubWallet) {
    window.SubWallet.isMetaMask = true;
  }

  if (window.ethereum) {
    window.ethereum.isMetaMask = true;
  }

  const hostName = window.location.hostname;

  if (hostName === 'app.solarbeam.io') {
    localStorage.setItem(
      'walletConnected',
      JSON.stringify({
        isMetaMask: false,
        isSubWallet: true,
      }),
    );

    window.postMessage(
      {
        id: 'app.solarbeam.io-${getId()}',
        message: 'evm(request)',
        origin: '${MESSAGE_ORIGIN_PAGE}',
        request: {
          params: [
            {
              chainId: '0x505',
            },
          ],
          method: 'wallet_switchEthereumChain',
        },
      },
      '*',
    );
  } else if (hostName === 'app.solarflare.io') {
    localStorage.setItem(
      'walletConnected',
      JSON.stringify({
        isMetaMask: false,
        isSubWallet: true,
      }),
    );
  } else if (hostName === 'app.beamswap.io') {
    const originSimpleUser = JSON.parse(localStorage.getItem('redux_localstorage_simple_user'));
    if (originSimpleUser.connector !== 'SUBWALLET') {
      originSimpleUser.connector = 'SUBWALLET';
      localStorage.setItem('redux_localstorage_simple_user', JSON.stringify(originSimpleUser));
    }
  }

  window.injectedWeb3['polkadot-js'] = window.injectedWeb3['subwallet-js'];

  if (${JSON.stringify(autoTriggerEthereumHosts)}.includes(hostName)) {
    window.SubWallet?.enable().catch(e => console.log(e));
  }

  if (${JSON.stringify(autoTriggerSubstrateHosts)}.includes(hostName)) {
    window.injectedWeb3['subwallet-js']?.enable().catch(e => console.log(e));
  }
})()`;
