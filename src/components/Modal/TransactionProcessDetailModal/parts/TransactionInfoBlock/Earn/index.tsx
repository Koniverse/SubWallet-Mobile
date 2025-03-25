import React, { useMemo } from 'react';
import { TransactionInfoBlockProps } from 'components/Modal/TransactionProcessDetailModal/parts/TransactionInfoBlock/types';
import { EarningProcessType, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import NativeStakingProcessConfirmation from 'components/Modal/TransactionProcessDetailModal/parts/TransactionInfoBlock/Earn/Bond';
import NominationPoolProcessConfirmation from 'components/Modal/TransactionProcessDetailModal/parts/TransactionInfoBlock/Earn/JoinPool';
import YieldProcessConfirmation from 'components/Modal/TransactionProcessDetailModal/parts/TransactionInfoBlock/Earn/JoinYieldPool';

type Props = TransactionInfoBlockProps;

export const Earn: React.FC<Props> = (props: Props) => {
  const { processData } = props;

  const type = useMemo(() => (processData.combineInfo as SummaryEarningProcessData).type, [processData]);

  if (type === EarningProcessType.NATIVE_STAKING) {
    return <NativeStakingProcessConfirmation {...props} />;
  } else if (type === EarningProcessType.NOMINATION_POOL) {
    return <NominationPoolProcessConfirmation {...props} />;
  } else {
    return <YieldProcessConfirmation {...props} />;
  }
};
