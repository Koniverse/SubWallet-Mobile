import qs from 'querystring';
import { MELD_API_KEY, MELD_TEST_MODE, MELD_URL } from 'constants/buy/meld';
import { CreateBuyOrderFunction } from 'types/buy';

type Params = {
  publicKey?: string;
  destinationCurrencyCode: string;
  walletAddress: string;
};

export const createMeldOrder: CreateBuyOrderFunction = (symbol, address) => {
  return new Promise(resolve => {
    const params: Params = {
      destinationCurrencyCode: symbol,
      walletAddress: address,
    };

    if (!MELD_TEST_MODE) {
      params.publicKey = MELD_API_KEY;
    }

    const query = qs.stringify(params);

    resolve(`${MELD_URL}?${query}`);
  });
};
