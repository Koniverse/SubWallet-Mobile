import {
  CheckCircle,
  ClockCounterClockwise,
  PaperPlaneTilt,
  ProhibitInset,
  Queue,
  Record,
  Spinner,
  StopCircle,
} from 'phosphor-react-native';
import { ExtrinsicStatus, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';
import { StatusType } from 'screens/Home/History/Detail';

export const StakingTypeNameMap = (): Record<string, string> => ({
  [ExtrinsicType.TRANSFER_BALANCE]: i18n.historyScreen.extrinsicType.transfer,
  [ExtrinsicType.TRANSFER_TOKEN]: i18n.historyScreen.extrinsicType.transfer,
  [ExtrinsicType.TRANSFER_XCM]: i18n.historyScreen.extrinsicType.transfer,
  [ExtrinsicType.SEND_NFT]: i18n.historyScreen.extrinsicType.nft,
  [ExtrinsicType.CROWDLOAN]: i18n.historyScreen.extrinsicType.crowdloan,
  [ExtrinsicType.STAKING_JOIN_POOL]: i18n.historyScreen.extrinsicType.stake,
  [ExtrinsicType.STAKING_BOND]: i18n.historyScreen.extrinsicType.bond,
  [ExtrinsicType.MINT_VDOT]: i18n.historyScreen.extrinsicType.mintVDOT,
  [ExtrinsicType.MINT_LDOT]: i18n.historyScreen.extrinsicType.mintLDOT,
  [ExtrinsicType.MINT_SDOT]: i18n.historyScreen.extrinsicType.mintSDOT,
  [ExtrinsicType.MINT_QDOT]: i18n.historyScreen.extrinsicType.mintQDOT,
  [ExtrinsicType.MINT_STDOT]: i18n.historyScreen.extrinsicType.mintSTDOT,
  [ExtrinsicType.STAKING_LEAVE_POOL]: i18n.historyScreen.extrinsicType.unstake,
  [ExtrinsicType.STAKING_UNBOND]: i18n.historyScreen.extrinsicType.unbond,
  [ExtrinsicType.JOIN_YIELD_POOL]: i18n.historyScreen.extrinsicType.stake,
  [ExtrinsicType.UNSTAKE_VDOT]: i18n.historyScreen.extrinsicType.unstakeVDOT,
  [ExtrinsicType.UNSTAKE_LDOT]: i18n.historyScreen.extrinsicType.unstakeLDOT,
  [ExtrinsicType.UNSTAKE_SDOT]: i18n.historyScreen.extrinsicType.unstakeSDOT,
  [ExtrinsicType.UNSTAKE_STDOT]: i18n.historyScreen.extrinsicType.unstakeSTDOT,
  [ExtrinsicType.UNSTAKE_QDOT]: i18n.historyScreen.extrinsicType.unstakeQDOT,
  [ExtrinsicType.REDEEM_VDOT]: i18n.historyScreen.extrinsicType.redeemVDOT,
  [ExtrinsicType.REDEEM_LDOT]: i18n.historyScreen.extrinsicType.redeemLDOT,
  [ExtrinsicType.REDEEM_SDOT]: i18n.historyScreen.extrinsicType.redeemSDOT,
  [ExtrinsicType.REDEEM_QDOT]: i18n.historyScreen.extrinsicType.redeemQDOT,
  [ExtrinsicType.REDEEM_STDOT]: i18n.historyScreen.extrinsicType.redeemSTDOT,
  [ExtrinsicType.STAKING_WITHDRAW]: i18n.historyScreen.extrinsicType.withdraw,
  [ExtrinsicType.STAKING_COMPOUNDING]: i18n.historyScreen.extrinsicType.compounding,
  [ExtrinsicType.STAKING_CLAIM_REWARD]: i18n.historyScreen.extrinsicType.claimReward,
  [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: i18n.historyScreen.extrinsicType.cancelUnstake,
  [ExtrinsicType.EVM_EXECUTE]: i18n.historyScreen.extrinsicType.evmExecute,
  [ExtrinsicType.TOKEN_APPROVE]: i18n.historyScreen.extrinsicType.tokenApprove,
});

export const TxTypeNameMap = (): Record<string, string> => ({
  ...StakingTypeNameMap(),
  transaction: i18n.historyScreen.title.transaction,
  submitting: i18n.common.submitting,
  processing: i18n.common.processing,
  send: i18n.common.send,
  receive: i18n.cryptoScreen.receive,
});

export const TxTypeTitleMap: Record<string, string> = {
  ...StakingTypeNameMap(),
  transaction: i18n.historyScreen.title.transaction,
  processing: i18n.common.processing,
  send: i18n.common.send,
  receive: i18n.cryptoScreen.receive,
  [ExtrinsicType.TRANSFER_BALANCE]: i18n.historyScreen.extrinsicType.transfer,
  [ExtrinsicType.TRANSFER_TOKEN]: i18n.historyScreen.extrinsicType.transfer,
  [ExtrinsicType.TRANSFER_XCM]: i18n.historyScreen.extrinsicType.transfer,
  [ExtrinsicType.SEND_NFT]: i18n.historyScreen.extrinsicType.nft,
  [ExtrinsicType.CROWDLOAN]: i18n.historyScreen.extrinsicType.crowdloan,
  [ExtrinsicType.STAKING_CLAIM_REWARD]: i18n.historyScreen.extrinsicType.claimReward,
  [ExtrinsicType.STAKING_CANCEL_UNSTAKE]: i18n.historyScreen.extrinsicType.cancelUnstake,
  [ExtrinsicType.EVM_EXECUTE]: i18n.historyScreen.extrinsicType.evmExecute,
};

export const HistoryStatusMap = (): Record<string, StatusType> => ({
  [ExtrinsicStatus.SUCCESS]: {
    schema: 'success',
    icon: CheckCircle,
    name: i18n.historyScreen.extrinsicStatus.completed,
    color: 'colorSuccess',
  },
  [ExtrinsicStatus.FAIL]: {
    schema: 'danger',
    icon: ProhibitInset,
    name: i18n.historyScreen.extrinsicStatus.failed,
    color: 'colorError',
  },
  [ExtrinsicStatus.QUEUED]: {
    schema: 'light',
    icon: Queue,
    name: i18n.historyScreen.extrinsicStatus.queued,
    color: 'gray-6',
  },
  [ExtrinsicStatus.SUBMITTING]: {
    schema: 'gold',
    icon: PaperPlaneTilt,
    name: i18n.historyScreen.extrinsicStatus.submitting,
    color: 'gold-6',
  },
  [ExtrinsicStatus.PROCESSING]: {
    schema: 'gold',
    icon: Spinner,
    name: i18n.historyScreen.extrinsicStatus.processing,
    color: 'gold-6',
  },
  [ExtrinsicStatus.CANCELLED]: {
    schema: 'gray',
    icon: StopCircle,
    name: i18n.historyScreen.extrinsicStatus.cancelled,
    color: 'gray-3',
  },
  [ExtrinsicStatus.UNKNOWN]: {
    schema: 'danger',
    icon: StopCircle,
    name: i18n.historyScreen.extrinsicStatus.unknown,
    color: 'gray-6',
  },
  [ExtrinsicStatus.TIMEOUT]: {
    schema: 'gold',
    icon: ClockCounterClockwise,
    name: i18n.historyScreen.extrinsicStatus.timeout,
    color: 'gold-6',
  },
});
