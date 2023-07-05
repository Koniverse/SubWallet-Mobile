// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationType } from 'stores/base/RequestState';
import { ExtraExtrinsicType, ExtrinsicTypeMobile } from 'types/transaction';
import i18n from 'utils/i18n/i18n';

export const TRANSACTION_TITLE_MAP = (): Record<ExtrinsicTypeMobile, string> => ({
  [ExtrinsicType.TRANSFER_BALANCE]: i18n.header.transfer,
  [ExtrinsicType.TRANSFER_XCM]: i18n.header.transfer,
  [ExtrinsicType.TRANSFER_TOKEN]: i18n.header.transfer,
  [ExtraExtrinsicType.IMPORT_NFT]: i18n.header.importNft,
  [ExtraExtrinsicType.IMPORT_TOKEN]: i18n.header.importToken,
  [ExtrinsicType.SEND_NFT]: i18n.header.transferNft,
  [ExtrinsicType.CROWDLOAN]: i18n.header.crowdloans,
  [ExtrinsicType.STAKING_JOIN_POOL]: i18n.header.addToBond,
  [ExtrinsicType.STAKING_BOND]: i18n.header.addToBond,
  [ExtrinsicType.STAKING_LEAVE_POOL]: i18n.header.unbond,
  [ExtrinsicType.STAKING_UNBOND]: i18n.header.unbond,
  [ExtrinsicType.STAKING_WITHDRAW]: i18n.header.withDraw,
  [ExtrinsicType.STAKING_POOL_WITHDRAW]: i18n.header.withDraw,
  [ExtrinsicType.STAKING_LEAVE_POOL]: i18n.header.unbond,
  [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: i18n.header.cancelUnstake,
  [ExtrinsicType.STAKING_CLAIM_REWARD]: i18n.header.claimRewards,
  [ExtrinsicType.STAKING_COMPOUNDING]: 'Compound',
  [ExtrinsicType.STAKING_CANCEL_COMPOUNDING]: 'Cancel Compound',
  [ExtrinsicType.EVM_EXECUTE]: 'Execute',
  [ExtrinsicType.UNKNOWN]: 'Unknown',
});

export const ALL_STAKING_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.STAKING_JOIN_POOL,
  ExtrinsicType.STAKING_BOND,
  ExtrinsicType.STAKING_LEAVE_POOL,
  ExtrinsicType.STAKING_UNBOND,
  ExtrinsicType.STAKING_WITHDRAW,
  ExtrinsicType.STAKING_POOL_WITHDRAW,
  ExtrinsicType.STAKING_LEAVE_POOL,
  ExtrinsicType.STAKING_CANCEL_UNSTAKE,
  ExtrinsicType.STAKING_CLAIM_REWARD,
  ExtrinsicType.STAKING_COMPOUNDING,
  ExtrinsicType.STAKING_CANCEL_COMPOUNDING,
];

export const NEED_SIGN_CONFIRMATION: ConfirmationType[] = [
  'evmSignatureRequest',
  'evmSendTransactionRequest',
  'signingRequest',
];
