import React, { useMemo } from 'react';
import { BaseProcessConfirmationProps } from 'screens/Confirmations/variants/Transaction/variants/Process/Base';
import { SubmitJoinNominationPool, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import { useGetTransactionProcessSteps } from 'hooks/transaction/process';

type Props = BaseProcessConfirmationProps;

const NominationPoolProcessConfirmation = ({ process }: Props) => {
  const combinedInfo = useMemo(() => process.combineInfo as SummaryEarningProcessData, [process.combineInfo]);
  const chain = useMemo(() => combinedInfo.brief.chain, [combinedInfo.brief.chain]);
  const data = useMemo(() => combinedInfo.data as unknown as SubmitJoinNominationPool, [combinedInfo]);
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);

  const getTransactionProcessSteps = useGetTransactionProcessSteps();

  const stepItems = useMemo(() => {
    return getTransactionProcessSteps(process.steps, process.combineInfo, false);
  }, [getTransactionProcessSteps, process.combineInfo, process.steps]);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={data.address} network={chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.Account address={data.selectedPool.address} label={i18n.inputLabel.pool} networkPrefix={42} />

        <MetaInfo.Number decimals={decimals} label={i18n.inputLabel.amount} suffix={symbol} value={data.amount} />

        <MetaInfo.Number decimals={decimals} label={i18n.inputLabel.estimatedFee} suffix={symbol} value={0} />

        <MetaInfo.TransactionProcess items={stepItems} type={process.type} />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default NominationPoolProcessConfirmation;
