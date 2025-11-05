import { CreateBuyOrderFunction } from 'types/buy';
import 'react-native-url-polyfill/auto';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

export const createCoinbaseOrder: CreateBuyOrderFunction = (asset, address, network) => {
  return subwalletApiSdk.onrampCoinbaseApi.generateOnRampUrl({
    assets: [asset],
    address,
    networks: [network],
  });
};
