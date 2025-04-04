import React, { useMemo } from 'react';
import { BaseProcessConfirmationProps } from '../Base';
import { SummaryEarningProcessData } from '@subwallet/extension-base/types';
import { RequestBondingSubmit, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { ConfirmationContent } from 'components/common/Confirmation';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import { useGetTransactionProcessSteps } from 'hooks/transaction/process';

type Props = BaseProcessConfirmationProps;

const NativeStakingProcessConfirmation = ({ process }: Props) => {
  const combinedInfo = useMemo(() => process.combineInfo as SummaryEarningProcessData, [process.combineInfo]);
  const chain = useMemo(() => combinedInfo.brief.chain, [combinedInfo.brief.chain]);
  const data = useMemo(() => combinedInfo.data as unknown as RequestBondingSubmit, [combinedInfo]);

  const handleValidatorLabel = useMemo(() => {
    return getValidatorLabel(chain);
  }, [chain]);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);
  const addressList = data.selectedValidators.map(validator => validator.address);
  const getTransactionProcessSteps = useGetTransactionProcessSteps();

  const stepItems = useMemo(() => {
    return getTransactionProcessSteps(process.steps, process.combineInfo, false);
  }, [getTransactionProcessSteps, process.combineInfo, process.steps]);

  return (
    <ConfirmationContent isFullHeight>
      <CommonTransactionInfo address={data.address} network={chain} />

      <MetaInfo hasBackgroundWrapper>
        <MetaInfo.AccountGroup
          addresses={addressList}
          content={`${data.selectedValidators.length} selected ${handleValidatorLabel.toLowerCase()}`}
          label={data.type === StakingType.POOLED ? 'Pool' : handleValidatorLabel}
        />

        <MetaInfo.Number decimals={decimals} label={i18n.inputLabel.amount} suffix={symbol} value={data.amount} />

        {/**
         * TODO: Convert value from steps' fee
         * */}
        <MetaInfo.Number decimals={decimals} label={i18n.inputLabel.estimatedFee} suffix={symbol} value={0} />

        <MetaInfo.TransactionProcess items={stepItems} type={process.type} />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default NativeStakingProcessConfirmation;
