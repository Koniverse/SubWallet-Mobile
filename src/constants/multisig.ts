// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import { MultisigTxType } from '@subwallet/extension-base/services/multisig-service';
import i18n from 'utils/i18n/i18n';

// Title shown as the headline of a pending multisig transaction.
export const MULTISIG_TX_TITLE_MAP = (): Record<MultisigTxType, string> => ({
  [MultisigTxType.TRANSFER]: i18n.multisig.txTitle.transfer,
  [MultisigTxType.STAKING]: i18n.multisig.txTitle.staking,
  [MultisigTxType.LENDING]: i18n.multisig.txTitle.lending,
  [MultisigTxType.SET_TOKEN_PAY_FEE]: i18n.multisig.txTitle.setTokenPayFee,
  [MultisigTxType.SWAP]: i18n.multisig.txTitle.swap,
  [MultisigTxType.TRANSFER_NFT]: i18n.multisig.txTitle.transferNFT,
  [MultisigTxType.REDEEM]: i18n.multisig.txTitle.redeem,
  [MultisigTxType.UNSTAKE]: i18n.multisig.txTitle.unstake,
  [MultisigTxType.WITHDRAW]: i18n.multisig.txTitle.withdraw,
  [MultisigTxType.CANCEL_UNSTAKE]: i18n.multisig.txTitle.cancelUnstake,
  [MultisigTxType.CLAIM_REWARD]: i18n.multisig.txTitle.claim,
  [MultisigTxType.NOMINATE]: i18n.multisig.txTitle.nominate,
  [MultisigTxType.GOV_VOTE]: i18n.multisig.txTitle.govVote,
  [MultisigTxType.GOV_REMOVE_VOTE]: i18n.multisig.txTitle.govRemoveVote,
  [MultisigTxType.GOV_UNLOCK_VOTE]: i18n.multisig.txTitle.govUnlockVote,
  [MultisigTxType.ADD_PROXY]: i18n.multisig.txTitle.addProxy,
  [MultisigTxType.REMOVE_PROXY]: i18n.multisig.txTitle.removeProxy,
  [MultisigTxType.UNKNOWN]: i18n.multisig.txTitle.multisigTransaction,
});

// Short label shown in the "Type" row of the multisig transaction detail.
export const MULTISIG_TX_TYPE_NAME_MAP = (): Record<MultisigTxType, string> => ({
  [MultisigTxType.TRANSFER]: i18n.multisig.txTypeName.transfer,
  [MultisigTxType.STAKING]: i18n.multisig.txTypeName.staking,
  [MultisigTxType.LENDING]: i18n.multisig.txTypeName.lending,
  [MultisigTxType.SET_TOKEN_PAY_FEE]: i18n.multisig.txTypeName.setTokenPayFee,
  [MultisigTxType.SWAP]: i18n.multisig.txTypeName.swap,
  [MultisigTxType.TRANSFER_NFT]: i18n.multisig.txTypeName.transferNFT,
  [MultisigTxType.REDEEM]: i18n.multisig.txTypeName.redeem,
  [MultisigTxType.UNSTAKE]: i18n.multisig.txTypeName.unstake,
  [MultisigTxType.WITHDRAW]: i18n.multisig.txTypeName.withdraw,
  [MultisigTxType.CANCEL_UNSTAKE]: i18n.multisig.txTypeName.cancelUnstake,
  [MultisigTxType.CLAIM_REWARD]: i18n.multisig.txTypeName.claim,
  [MultisigTxType.NOMINATE]: i18n.multisig.txTypeName.nominate,
  [MultisigTxType.GOV_VOTE]: i18n.multisig.txTypeName.govVote,
  [MultisigTxType.GOV_REMOVE_VOTE]: i18n.multisig.txTypeName.govRemoveVote,
  [MultisigTxType.GOV_UNLOCK_VOTE]: i18n.multisig.txTypeName.govUnlockVote,
  [MultisigTxType.ADD_PROXY]: i18n.multisig.txTypeName.addProxy,
  [MultisigTxType.REMOVE_PROXY]: i18n.multisig.txTypeName.removeProxy,
  [MultisigTxType.UNKNOWN]: i18n.multisig.txTypeName.unknown,
});

export const MULTISIG_ACTIONS: ExtrinsicType[] = [
  ExtrinsicType.MULTISIG_APPROVE_TX,
  ExtrinsicType.MULTISIG_EXECUTE_TX,
  ExtrinsicType.MULTISIG_CANCEL_TX,
  ExtrinsicType.MULTISIG_INIT_TX,
];

export const MULTISIG_HISTORY_INFO_MODAL = 'multisig-history-info-modal';
export const WRAPPED_TRANSACTION_SIGNER_SELECTOR_MODAL = 'wrapped-transaction-signer-selector-modal';
export const SUBSTRATE_PROXY_ACCOUNT_LIST_MODAL = 'substrate-proxy-account-list-modal';
