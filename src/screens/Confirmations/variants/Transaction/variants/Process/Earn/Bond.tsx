import React, { useMemo } from 'react';
import { BaseProcessConfirmationProps } from '../Base';
import { ProcessTransactionData, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import { RequestBondingSubmit, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import { useGetTransactionProcessSteps } from 'hooks/transaction/process';

type Props = BaseProcessConfirmationProps;

const NativeStakingProcessConfirmation = ({ transaction }: Props) => {
  const process = useMemo(() => transaction.process as ProcessTransactionData, [transaction.process]);
  const data = useMemo(
    () => (process.combineInfo as SummaryEarningProcessData).data as unknown as RequestBondingSubmit,
    [process.combineInfo],
  );

  const handleValidatorLabel = useMemo(() => {
    return getValidatorLabel(transaction.chain);
  }, [transaction.chain]);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(transaction.chain);
  const addressList = data.selectedValidators.map(validator => validator.address);
  const getTransactionProcessSteps = useGetTransactionProcessSteps();

  const stepItems = useMemo(() => {
    return getTransactionProcessSteps(process.steps, process.combineInfo, false);
  }, [getTransactionProcessSteps, process.combineInfo, process.steps]);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={transaction.address} network={transaction.chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.AccountGroup
          addresses={addressList}
          content={`${data.selectedValidators.length} selected ${handleValidatorLabel.toLowerCase()}`}
          label={data.type === StakingType.POOLED ? 'Pool' : handleValidatorLabel}
        />

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

export default NativeStakingProcessConfirmation;
