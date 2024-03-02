import { TRANSAK_API_KEY, TRANSAK_URL } from 'constants/buy';
import { CreateBuyOrderFunction } from 'types/buy';
import qs from 'querystring';

export const createTransakOrder: CreateBuyOrderFunction = (symbol, address, network) => {
  return new Promise(resolve => {
    const params = {
      apiKey: TRANSAK_API_KEY,
      defaultCryptoCurrency: symbol,
      networks: network,
      cryptoCurrencyList: symbol,
      walletAddress: address,
    };

    const query = qs.stringify(params);

    resolve(`${TRANSAK_URL}?${query}`);
  });
};
