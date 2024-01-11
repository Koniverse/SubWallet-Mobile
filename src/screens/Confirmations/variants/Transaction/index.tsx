import React, { useCallback, useMemo } from 'react';
import { ConfirmationDefinitions, ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';

import { ConfirmationQueueItem } from 'stores/base/RequestState';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SigningRequest } from '@subwallet/extension-base/background/types';
import useParseSubstrateRequestPayload from 'hooks/transaction/confirmation/useParseSubstrateRequestPayload';
import { SWTransactionResult } from '@subwallet/extension-base/services/transaction-service/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import { EvmSignArea, SubstrateSignArea } from '../../parts';
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
} from './variants';

interface Props {
  confirmation: ConfirmationQueueItem;
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

const getTransactionComponent = (extrinsicType: ExtrinsicType): typeof BaseTransactionConfirmation => {
  switch (extrinsicType) {
    case ExtrinsicType.TRANSFER_BALANCE:
    case ExtrinsicType.TRANSFER_TOKEN:
    case ExtrinsicType.TRANSFER_XCM:
      return TransferBlock;
    case ExtrinsicType.SEND_NFT:
      return SendNftTransactionConfirmation;
    case ExtrinsicType.STAKING_JOIN_POOL:
      return JoinPoolTransactionConfirmation;
    case ExtrinsicType.STAKING_LEAVE_POOL:
      return LeavePoolTransactionConfirmation;
    case ExtrinsicType.STAKING_BOND:
      return BondTransactionConfirmation;
    case ExtrinsicType.STAKING_UNBOND:
      return UnbondTransactionConfirmation;
    case ExtrinsicType.STAKING_WITHDRAW:
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
      return JoinYieldPoolConfirmation;
    case ExtrinsicType.REDEEM_QDOT:
    case ExtrinsicType.REDEEM_VDOT:
    case ExtrinsicType.REDEEM_LDOT:
    case ExtrinsicType.REDEEM_SDOT:
    case ExtrinsicType.REDEEM_STDOT:
      return FastWithdrawTransactionConfirmation;
    case ExtrinsicType.UNSTAKE_QDOT:
    case ExtrinsicType.UNSTAKE_VDOT:
    case ExtrinsicType.UNSTAKE_LDOT:
    case ExtrinsicType.UNSTAKE_SDOT:
      return DefaultWithdrawTransactionConfirmation;
    default:
      return BaseTransactionConfirmation;
  }
};

export const TransactionConfirmation = (props: Props) => {
  const {
    confirmation: { item, type },
    navigation,
  } = props;
  const { id } = item;

  const { transactionRequest } = useSelector((state: RootState) => state.requestState);

  const _transaction = useMemo(() => transactionRequest[id], [transactionRequest, id]);

  const substratePayload = useParseSubstrateRequestPayload(
    type === 'signingRequest' ? (item as SigningRequest).request : undefined,
  );

  const renderContent = useCallback((transaction: SWTransactionResult): React.ReactNode => {
    const { extrinsicType } = transaction;

    const Component = getTransactionComponent(extrinsicType);

    return <Component transaction={transaction} />;
  }, []);
  return (
    <>
      {renderContent(_transaction)}
      {type === 'signingRequest' && (
        <SubstrateSignArea
          account={(item as SigningRequest).account}
          id={item.id}
          payload={substratePayload}
          navigation={navigation}
        />
      )}
      {type === 'evmSendTransactionRequest' && (
        <EvmSignArea
          id={item.id}
          payload={item as ConfirmationDefinitions['evmSendTransactionRequest'][0]}
          type="evmSendTransactionRequest"
          navigation={navigation}
        />
      )}
    </>
  );
};
