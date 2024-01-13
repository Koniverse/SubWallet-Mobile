import { ExtrinsicType, TransactionAdditionalInfo } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import MetaInfo from 'components/MetaInfo';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TransactionHistoryDisplayItem } from 'types/history';
import { BN_TEN } from 'utils/number';
import { isPoolLeave, isTypeMint, isTypeStaking } from 'utils/transaction/detectType';
import i18n from 'utils/i18n/i18n';
import PoolLeaveAmount from './PoolLeaveAmount';

interface Props {
  data: TransactionHistoryDisplayItem;
}

const HistoryDetailAmount: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const { amount, type: transactionType } = data;

  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);

  const isStaking = isTypeStaking(data.type);
  const isCrowdloan = data.type === ExtrinsicType.CROWDLOAN;
  const isNft = data.type === ExtrinsicType.SEND_NFT;
  const isMint = isTypeMint(data.type);
  const isLeavePool = isPoolLeave(data.type);

  const additionalInfo = data.additionalInfo;

  const amountLabel = useMemo((): string => {
    switch (transactionType) {
      case ExtrinsicType.STAKING_BOND:
      case ExtrinsicType.STAKING_JOIN_POOL:
        return i18n.historyScreen.label.stakingValue;
      case ExtrinsicType.STAKING_WITHDRAW:
      case ExtrinsicType.STAKING_POOL_WITHDRAW:
        return i18n.historyScreen.label.withdrawValue;
      case ExtrinsicType.STAKING_UNBOND:
        return i18n.historyScreen.label.unstakeValue;
      case ExtrinsicType.STAKING_CANCEL_UNSTAKE:
        return i18n.historyScreen.label.cancelUnstakeValue;
      case ExtrinsicType.CROWDLOAN:
        return i18n.historyScreen.label.contributeBalance;
      default:
        return i18n.historyScreen.label.amount;
    }
  }, [transactionType]);

  const derivativeTokenSlug = useMemo((): string | undefined => {
    if (isMint) {
      if (additionalInfo) {
        return (additionalInfo as TransactionAdditionalInfo[ExtrinsicType.MINT_QDOT])?.derivativeTokenSlug;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }, [additionalInfo, isMint]);

  const amountDerivative = useMemo(() => {
    if (amount && derivativeTokenSlug && additionalInfo) {
      const rate = (additionalInfo as TransactionAdditionalInfo[ExtrinsicType.MINT_QDOT])?.exchangeRate;

      if (rate) {
        return new BigN(amount.value).div(BN_TEN.pow(amount.decimals)).div(rate);
      }
    }

    return undefined;
  }, [additionalInfo, amount, derivativeTokenSlug]);

  const derivativeSymbol = useMemo(() => {
    return derivativeTokenSlug ? assetRegistry[derivativeTokenSlug].symbol : '';
  }, [assetRegistry, derivativeTokenSlug]);

  if (isLeavePool && data.additionalInfo) {
    return <PoolLeaveAmount data={data} />;
  }

  return (
    <>
      {(isStaking || isCrowdloan || amount) && (
        <MetaInfo.Number
          decimals={amount?.decimals || undefined}
          label={amountLabel}
          suffix={amount?.symbol || undefined}
          value={amount?.value || '0'}
        />
      )}
      {isMint && amountDerivative && (
        <MetaInfo.Number
          decimals={0}
          label={i18n.historyScreen.label.estimatedReceivables}
          suffix={derivativeSymbol}
          value={amountDerivative}
        />
      )}
      {data.additionalInfo && isNft && (
        <MetaInfo.Default label={i18n.historyScreen.label.collectionName}>
          {(data.additionalInfo as TransactionAdditionalInfo[ExtrinsicType.SEND_NFT]).collectionName}
        </MetaInfo.Default>
      )}
    </>
  );
};

export default HistoryDetailAmount;
