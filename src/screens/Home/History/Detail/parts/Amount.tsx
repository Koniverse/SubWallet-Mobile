import { ExtrinsicType, TransactionAdditionalInfo } from '@subwallet/extension-base/background/KoniTypes';
import MetaInfo from 'components/MetaInfo';
import React, { useMemo } from 'react';
import { TransactionHistoryDisplayItem } from 'types/history';
import { isTypeStaking } from 'utils/transaction/detectType';
import i18n from 'utils/i18n/i18n';

interface Props {
  data: TransactionHistoryDisplayItem;
}

const HistoryDetailAmount: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const { amount, type: transactionType } = data;

  const isStaking = isTypeStaking(data.type);
  const isCrowdloan = data.type === ExtrinsicType.CROWDLOAN;
  const isNft = data.type === ExtrinsicType.SEND_NFT;

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
      {data.additionalInfo && isNft && (
        <MetaInfo.Default label={i18n.historyScreen.label.collectionName}>
          {(data.additionalInfo as TransactionAdditionalInfo<ExtrinsicType.SEND_NFT>).collectionName}
        </MetaInfo.Default>
      )}
    </>
  );
};

export default HistoryDetailAmount;
