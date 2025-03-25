import React, { useMemo } from 'react';
import { BaseProcessConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Process/Base';
import {
  ProcessTransactionData,
  SubmitJoinNominationPool,
  SummaryEarningProcessData,
} from '@subwallet/extension-base/types';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import { useGetTransactionProcessSteps } from 'hooks/transaction/process';

type Props = BaseProcessConfirmationProps;

const NominationPoolProcessConfirmation = ({ transaction }: Props) => {
  const process = useMemo(() => transaction.process as ProcessTransactionData, [transaction.process]);
  const data = useMemo(
    () => (process.combineInfo as SummaryEarningProcessData).data as unknown as SubmitJoinNominationPool,
    [process.combineInfo],
  );

  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);

  const getTransactionProcessSteps = useGetTransactionProcessSteps();

  const stepItems = useMemo(() => {
    return getTransactionProcessSteps(process.steps, process.combineInfo, false);
  }, [getTransactionProcessSteps, process.combineInfo, process.steps]);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={data.selectedPool.address} label={i18n.inputLabel.pool} networkPrefix={42} />

        <MetaInfo.Number decimals={decimals} label={i18n.inputLabel.amount} suffix={symbol} value={data.amount} />

        <MetaInfo.Number
          decimals={decimals}
          label={i18n.inputLabel.estimatedFee}
          suffix={symbol}
          value={transaction.estimateFee?.value || 0}
        />

        <MetaInfo.TransactionProcess items={stepItems} type={process.type} />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default NominationPoolProcessConfirmation;
