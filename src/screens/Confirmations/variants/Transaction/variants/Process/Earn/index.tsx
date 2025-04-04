import { EarningProcessType, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import React, { useMemo } from 'react';
import { BaseProcessConfirmationProps } from '../Base';
import NativeStakingProcessConfirmation from 'screens/Confirmations/variants/Transaction/variants/Process/Earn/Bond';
import NominationPoolProcessConfirmation from 'screens/Confirmations/variants/Transaction/variants/Process/Earn/JoinPool';
import YieldProcessConfirmation from 'screens/Confirmations/variants/Transaction/variants/Process/Earn/JoinYieldPool';

type Props = BaseProcessConfirmationProps;

const EarnProcessConfirmation = (props: Props) => {
  const { process } = props;

  const type = useMemo(() => (process.combineInfo as SummaryEarningProcessData).type, [process]);

  if (type === EarningProcessType.NATIVE_STAKING) {
    return <NativeStakingProcessConfirmation {...props} />;
  } else if (type === EarningProcessType.NOMINATION_POOL) {
    return <NominationPoolProcessConfirmation {...props} />;
  } else {
    return <YieldProcessConfirmation {...props} />;
  }
};

export default EarnProcessConfirmation;
