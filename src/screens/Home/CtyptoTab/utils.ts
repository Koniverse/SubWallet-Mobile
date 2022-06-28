// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BigN from 'bignumber.js';
import { BalanceInfo } from '../../../types';
import { BN_ZERO } from 'utils/chainBalances';

export function hasAnyChildTokenBalance(balanceInfo: BalanceInfo): boolean {
  if (!balanceInfo.childrenBalances || !balanceInfo.childrenBalances.length) {
    return false;
  }

  for (const item of balanceInfo.childrenBalances) {
    if (item.balanceValue.gt(BN_ZERO)) {
      return true;
    }
  }

  return false;
}

export function getTotalConvertedBalanceValue(balanceInfo: BalanceInfo): BigN {
  if (!balanceInfo) {
    return BN_ZERO;
  }

  let result = new BigN(balanceInfo.convertedBalanceValue);

  if (balanceInfo.childrenBalances && balanceInfo.childrenBalances.length) {
    balanceInfo.childrenBalances.forEach(i => {
      result = result.plus(i.convertedBalanceValue);
    });
  }

  return result;
}
