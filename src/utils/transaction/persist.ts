// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';

import { removeStorage } from '../common';
import {
  CANCEL_UN_STAKE_TRANSACTION,
  CLAIM_REWARD_TRANSACTION,
  EARN_TRANSACTION,
  NFT_TRANSACTION,
  STAKE_TRANSACTION,
  SWAP_TRANSACTION,
  TRANSFER_TRANSACTION,
  UN_STAKE_TRANSACTION,
  WITHDRAW_TRANSACTION,
} from 'constants/localStorage';
import { ExtraExtrinsicType, ExtrinsicTypeMobile } from 'types/transaction';

export const detectTransactionPersistKey = (type?: ExtrinsicTypeMobile): string => {
  switch (type) {
    case ExtrinsicType.SEND_NFT:
      return NFT_TRANSACTION;
    case ExtrinsicType.TRANSFER_BALANCE:
    case ExtrinsicType.TRANSFER_TOKEN:
    case ExtrinsicType.TRANSFER_XCM:
      return TRANSFER_TRANSACTION;
    case ExtrinsicType.STAKING_BOND:
    case ExtrinsicType.STAKING_JOIN_POOL:
      return STAKE_TRANSACTION;
    case ExtrinsicType.JOIN_YIELD_POOL:
      return EARN_TRANSACTION;
    case ExtrinsicType.STAKING_UNBOND:
    case ExtrinsicType.STAKING_LEAVE_POOL:
      return UN_STAKE_TRANSACTION;
    case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
      return CANCEL_UN_STAKE_TRANSACTION;
    case ExtrinsicType.STAKING_WITHDRAW:
    case ExtrinsicType.STAKING_POOL_WITHDRAW:
      return WITHDRAW_TRANSACTION;
    case ExtrinsicType.STAKING_CLAIM_REWARD:
      return CLAIM_REWARD_TRANSACTION;
    case ExtrinsicType.SWAP:
      return SWAP_TRANSACTION;
    case ExtraExtrinsicType.IMPORT_NFT:
      return ExtraExtrinsicType.IMPORT_NFT;
    case ExtraExtrinsicType.IMPORT_TOKEN:
      return ExtraExtrinsicType.IMPORT_TOKEN;
    // case ExtrinsicType.CLAIM_AVAIL_BRIDGE:
    //   return CLAIM_AVAIL_BRIDGE_TRANSACTION;
    default:
      return '';
  }
};

export const removeTransactionPersist = (type?: ExtrinsicType) => {
  const key = detectTransactionPersistKey(type);

  if (key) {
    removeStorage(key);
  }

  // window.localStorage.setItem(CURRENT_PAGE, '/home/tokens');
};
