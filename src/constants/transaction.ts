// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ExtrinsicType, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationType } from 'stores/base/RequestState';
import {
  CancelUnStakeParams,
  ClaimRewardParams,
  EarnParams,
  ExtraExtrinsicType,
  ExtrinsicTypeMobile,
  SendNftParams,
  StakeParams,
  SwapParams,
  TransactionFormBaseProps,
  TransferParams,
  UnStakeParams,
  WithdrawParams,
} from 'types/transaction';
import i18n from 'utils/i18n/i18n';
import { ALL_KEY } from 'constants/index';

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
  [ExtrinsicType.MINT_VDOT]: i18n.header.mintVDOT,
  [ExtrinsicType.MINT_VMANTA]: i18n.header.mintVMANTA,
  [ExtrinsicType.MINT_LDOT]: i18n.header.mintLDOT,
  [ExtrinsicType.MINT_SDOT]: i18n.header.mintSDOT,
  [ExtrinsicType.MINT_QDOT]: i18n.header.mintQDOT,
  [ExtrinsicType.MINT_STDOT]: i18n.header.mintSTDOT,
  [ExtrinsicType.REDEEM_VDOT]: i18n.header.redeemVDOT,
  [ExtrinsicType.REDEEM_VMANTA]: i18n.header.redeemVMANTA,
  [ExtrinsicType.REDEEM_LDOT]: i18n.header.redeemLDOT,
  [ExtrinsicType.REDEEM_SDOT]: i18n.header.redeemSDOT,
  [ExtrinsicType.REDEEM_QDOT]: i18n.header.redeemQDOT,
  [ExtrinsicType.REDEEM_STDOT]: i18n.header.redeemSTDOT,
  [ExtrinsicType.JOIN_YIELD_POOL]: i18n.header.addToBond,
  [ExtrinsicType.UNSTAKE_VDOT]: i18n.header.unstakeVDOT,
  [ExtrinsicType.UNSTAKE_VMANTA]: i18n.header.unstakeVMANTA,
  [ExtrinsicType.UNSTAKE_LDOT]: i18n.header.unstakeLDOT,
  [ExtrinsicType.UNSTAKE_SDOT]: i18n.header.unstakeSDOT,
  [ExtrinsicType.UNSTAKE_STDOT]: i18n.header.unstakeSTDOT,
  [ExtrinsicType.UNSTAKE_QDOT]: i18n.header.unstakeQDOT,
  [ExtrinsicType.TOKEN_SPENDING_APPROVAL]: i18n.header.tokenApprove,
  [ExtrinsicType.STAKING_COMPOUNDING]: 'Compound',
  [ExtrinsicType.STAKING_CANCEL_COMPOUNDING]: 'Cancel Compound',
  [ExtrinsicType.EVM_EXECUTE]: 'Execute',
  [ExtrinsicType.UNKNOWN]: 'Unknown',
  [ExtrinsicType.SWAP]: 'Swap',
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

export const DEFAULT_TRANSACTION_PARAMS: TransactionFormBaseProps = {
  asset: '',
  chain: '',
  from: '',
};

export const DEFAULT_TRANSFER_PARAMS: TransferParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  defaultSlug: '',
  destChain: '',
  to: '',
  value: '',
};

export const DEFAULT_NFT_PARAMS: SendNftParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  collectionId: '',
  itemId: '',
  to: '',
};

export const DEFAULT_STAKE_PARAMS: StakeParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  nominate: '',
  pool: '',
  type: '' as StakingType,
  value: '',
  defaultChain: ALL_KEY,
  defaultType: ALL_KEY,
};

export const DEFAULT_EARN_PARAMS: EarnParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: '',
  target: '',
  value: '',
  redirectFromPreview: false,
  hasPreSelectTarget: false,
};

export const DEFAULT_UN_STAKE_PARAMS: UnStakeParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: '',
  fastLeave: false,
  validator: '',
  value: '',
};

export const DEFAULT_CANCEL_UN_STAKE_PARAMS: CancelUnStakeParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: '',
  unstake: '',
};

export const DEFAULT_WITHDRAW_PARAMS: WithdrawParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: '',
};

export const DEFAULT_CLAIM_REWARD_PARAMS: ClaimRewardParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  slug: '',
  bondReward: false,
};

export const DEFAULT_SWAP_PARAMS: SwapParams = {
  ...DEFAULT_TRANSACTION_PARAMS,
  fromAmount: '',
  fromTokenSlug: '',
  toTokenSlug: '',
};
