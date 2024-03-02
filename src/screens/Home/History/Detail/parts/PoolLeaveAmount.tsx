import { LeavePoolAdditionalData, YieldPoolType } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';
import MetaInfo from 'components/MetaInfo';
import React, { useMemo } from 'react';
import { TransactionHistoryDisplayItem } from 'types/history';
import i18n from 'utils/i18n/i18n';

interface Props {
  data: TransactionHistoryDisplayItem;
}

const PoolLeaveAmount: React.FC<Props> = (props: Props) => {
  const { data } = props;
  const { amount } = data;

  const additionalInfo = data.additionalInfo as LeavePoolAdditionalData;

  const isLending = useMemo(() => additionalInfo.type === YieldPoolType.LENDING, [additionalInfo.type]);
  const amountValue = useMemo(() => new BigN(amount?.value || '0'), [amount?.value]);
  const estimatedValue = useMemo(
    () => amountValue.multipliedBy(additionalInfo.exchangeRate),
    [additionalInfo.exchangeRate, amountValue],
  );
  const minReceiveValue = useMemo(
    () => estimatedValue.multipliedBy(additionalInfo.minAmountPercent),
    [additionalInfo.minAmountPercent, estimatedValue],
  );

  return (
    <>
      <MetaInfo.Number
        decimals={amount?.decimals || undefined}
        label={i18n.historyScreen.label.amount}
        suffix={amount?.symbol || undefined}
        value={amountValue}
      />
      {!isLending && (
        <MetaInfo.Number
          decimals={additionalInfo.decimals}
          label={i18n.historyScreen.label.estimatedReceivables}
          suffix={additionalInfo.symbol}
          value={estimatedValue}
        />
      )}
      {additionalInfo.isFast && (
        <MetaInfo.Number
          decimals={additionalInfo.decimals}
          label={i18n.historyScreen.label.minimumReceivables}
          suffix={additionalInfo.symbol}
          value={minReceiveValue}
        />
      )}
    </>
  );
};

export default PoolLeaveAmount;
