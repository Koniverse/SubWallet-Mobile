// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BANXA_URL } from 'constants/buy';
import qs from 'querystring';
import { CreateBuyOrderFunction } from 'types/buy';

export const createBanxaOrder: CreateBuyOrderFunction = (token, address, network) => {
  return new Promise(resolve => {
    const params = {
      coinType: token,
      blockchain: network,
      walletAddress: address,
      orderType: 'BUY',
    };

    const query = qs.stringify(params);

    resolve(`${BANXA_URL}?${query}`);
  });
};
