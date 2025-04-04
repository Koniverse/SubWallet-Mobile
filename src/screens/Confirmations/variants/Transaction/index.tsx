import React, { useCallback, useMemo } from 'react';
import {
  ConfirmationDefinitions,
  ConfirmationDefinitionsTon,
  ExtrinsicType,
} from '@subwallet/extension-base/background/KoniTypes';

import { ConfirmationQueueItem } from 'stores/base/RequestState';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { EvmSignArea, SubstrateSignArea, TonSignArea } from '../../parts';
import {
  JoinPoolTransactionConfirmation,
  SendNftTransactionConfirmation,
  FastWithdrawTransactionConfirmation,
  DefaultWithdrawTransactionConfirmation,
  BaseTransactionConfirmation,
  BondTransactionConfirmation,
  CancelUnstakeTransactionConfirmation,
  ClaimRewardTransactionConfirmation,
  JoinYieldPoolConfirmation,
  LeavePoolTransactionConfirmation,
  UnbondTransactionConfirmation,
  TransferBlock,
  WithdrawTransactionConfirmation,
  TokenApproveConfirmation,
  SwapTransactionConfirmation,
  ClaimBridgeTransactionConfirmation,
  SwapProcessConfirmation,
  EarnProcessConfirmation,
} from './variants';
import { SwapBaseTxData, SwapTxData } from '@subwallet/extension-base/types/swap';
import { ProcessType } from '@subwallet/extension-base/types';
import BaseProcessConfirmation from 'screens/Confirmations/variants/Transaction/variants/Process/Base';
import { VoidFunction } from 'types/index';
import { ConfirmModalInfo } from 'providers/AppModalContext';

interface Props {
  confirmation: ConfirmationQueueItem;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  openAlert: React.Dispatch<React.SetStateAction<ConfirmModalInfo>>;
  closeAlert: VoidFunction;
}

const getProcessComponent = (processType: ProcessType): typeof BaseProcessConfirmation => {
  switch (processType) {
    case ProcessType.SWAP:
      return SwapProcessConfirmation;
    case ProcessType.EARNING:
      return EarnProcessConfirmation;
    default:
      return BaseProcessConfirmation;
  }
};

const getTransactionComponent = (extrinsicType: ExtrinsicType): typeof BaseTransactionConfirmation => {
  switch (extrinsicType) {
    case ExtrinsicType.TRANSFER_BALANCE:
    case ExtrinsicType.TRANSFER_TOKEN:
    case ExtrinsicType.TRANSFER_XCM:
      return TransferBlock;
    case ExtrinsicType.SEND_NFT:
      return SendNftTransactionConfirmation;
    case ExtrinsicType.STAKING_JOIN_POOL:
    case ExtrinsicType.JOIN_YIELD_POOL:
      return JoinPoolTransactionConfirmation;
    case ExtrinsicType.STAKING_LEAVE_POOL:
      return LeavePoolTransactionConfirmation;
    case ExtrinsicType.STAKING_BOND:
      return BondTransactionConfirmation;
    case ExtrinsicType.STAKING_UNBOND:
      return UnbondTransactionConfirmation;
    case ExtrinsicType.STAKING_WITHDRAW:
    case ExtrinsicType.STAKING_POOL_WITHDRAW:
      return WithdrawTransactionConfirmation;
    case ExtrinsicType.STAKING_CLAIM_REWARD:
      return ClaimRewardTransactionConfirmation;
    case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
      return CancelUnstakeTransactionConfirmation;
    case ExtrinsicType.MINT_QDOT:
    case ExtrinsicType.MINT_VDOT:
    case ExtrinsicType.MINT_LDOT:
    case ExtrinsicType.MINT_SDOT:
    case ExtrinsicType.MINT_STDOT:
    case ExtrinsicType.MINT_VMANTA:
      return JoinYieldPoolConfirmation;
    case ExtrinsicType.REDEEM_QDOT:
    case ExtrinsicType.REDEEM_VDOT:
    case ExtrinsicType.REDEEM_LDOT:
    case ExtrinsicType.REDEEM_SDOT:
    case ExtrinsicType.REDEEM_STDOT:
    case ExtrinsicType.REDEEM_VMANTA:
      return FastWithdrawTransactionConfirmation;
    case ExtrinsicType.UNSTAKE_QDOT:
    case ExtrinsicType.UNSTAKE_VDOT:
    case ExtrinsicType.UNSTAKE_LDOT:
    case ExtrinsicType.UNSTAKE_SDOT:
    case ExtrinsicType.UNSTAKE_STDOT:
    case ExtrinsicType.UNSTAKE_VMANTA:
      return DefaultWithdrawTransactionConfirmation;
    case ExtrinsicType.CLAIM_BRIDGE:
      return ClaimBridgeTransactionConfirmation;
    case ExtrinsicType.TOKEN_SPENDING_APPROVAL:
      return TokenApproveConfirmation;
    case ExtrinsicType.SWAP:
      return SwapTransactionConfirmation;
    default:
      return BaseTransactionConfirmation;
  }
};

export const TransactionConfirmation = (props: Props) => {
  const {
    confirmation: { item, type },
    navigation,
    openAlert,
    closeAlert,
  } = props;
  const { id } = item;

  const { transactionRequest } = useSelector((state: RootState) => state.requestState);
  const _transaction = useMemo(() => transactionRequest[id], [transactionRequest, id]);

  const renderContent = useCallback(
    (transaction: SWTransactionResult): React.ReactNode => {
      const { extrinsicType, process } = transaction;

      if (process) {
        const Component = getProcessComponent(process.type);

        return <Component closeAlert={closeAlert} openAlert={openAlert} process={process} />;
      }

      const Component = getTransactionComponent(extrinsicType);

      return <Component closeAlert={closeAlert} openAlert={openAlert} transaction={transaction} />;
    },
    [closeAlert, openAlert],
  );

  const txExpirationTime = useMemo((): number | undefined => {
    // transaction might only be valid for a certain period of time
    if (_transaction.extrinsicType === ExtrinsicType.SWAP) {
      const data = _transaction.data as SwapTxData;

      return data.quote.aliveUntil;
    }
    if (_transaction.process && _transaction.process.type === ProcessType.SWAP) {
      const data = _transaction.process.combineInfo as SwapBaseTxData;

      return data.quote.aliveUntil;
    }

    return undefined;
  }, [_transaction.data, _transaction.extrinsicType, _transaction.process]);

  return (
    <>
      {renderContent(_transaction)}
      {type === 'signingRequest' && (
        <SubstrateSignArea
          extrinsicType={_transaction.extrinsicType}
          id={item.id}
          isInternal={item.isInternal}
          request={(item as SigningRequest).request}
          navigation={navigation}
          txExpirationTime={txExpirationTime}
        />
      )}
      {(type === 'evmSendTransactionRequest' || type === 'evmWatchTransactionRequest') && (
        <EvmSignArea
          id={item.id}
          payload={item as ConfirmationDefinitions['evmSendTransactionRequest' | 'evmWatchTransactionRequest'][0]}
          type={type}
          navigation={navigation}
          txExpirationTime={txExpirationTime}
        />
      )}
      {(type === 'tonSendTransactionRequest' || type === 'tonWatchTransactionRequest') && (
        <TonSignArea
          navigation={navigation}
          extrinsicType={_transaction.extrinsicType}
          id={item.id}
          payload={item as ConfirmationDefinitionsTon['tonSendTransactionRequest' | 'tonWatchTransactionRequest'][0]}
          txExpirationTime={txExpirationTime}
          type={type}
        />
      )}
    </>
  );
};
