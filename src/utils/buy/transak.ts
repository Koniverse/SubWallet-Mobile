import { CreateBuyOrderFunction } from 'types/buy';
import subwalletApiSdk from '@subwallet-monorepos/subwallet-services-sdk';

export const createTransakOrder: CreateBuyOrderFunction = (symbol, address, network) => {
  return subwalletApiSdk.transakApi.generateOrderUrl({
    symbol: symbol,
    address: address,
    network: network,
    action: 'BUY',
    referrerDomain: 'app.subwallet.mobile',
  });
};
