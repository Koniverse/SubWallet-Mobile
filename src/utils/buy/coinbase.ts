import { generateOnRampURL } from '@coinbase/cbpay-js';
import { COINBASE_PAY_ID } from 'constants/buy';
import { CreateBuyOrderFunction } from 'types/buy';
import 'react-native-url-polyfill/auto';

export const createCoinbaseOrder: CreateBuyOrderFunction = (symbol, address, network) => {
  return new Promise(resolve => {
    const onRampURL = generateOnRampURL({
      appId: COINBASE_PAY_ID,
      destinationWallets: [{ address: address, supportedNetworks: [network], assets: [symbol] }],
    });

    resolve(onRampURL);
  });
};
