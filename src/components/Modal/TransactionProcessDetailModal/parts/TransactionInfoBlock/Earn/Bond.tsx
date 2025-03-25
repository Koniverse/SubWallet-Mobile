import React, { useMemo } from 'react';
import { TransactionInfoBlockProps } from '../types';
import { SummaryEarningProcessData } from '@subwallet/extension-base/types';
import { RequestBondingSubmit, StakingType } from '@subwallet/extension-base/background/KoniTypes';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getValidatorLabel } from '@subwallet/extension-base/koni/api/staking/bonding/utils';
import useGetNativeTokenBasicInfo from 'hooks/useGetNativeTokenBasicInfo';
import { CommonFeeComponent } from '@subwallet/extension-base/types/service-base';
import { ConfirmationContent } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import i18n from 'utils/i18n/i18n';
import { getCurrentCurrencyTotalFee } from 'utils/common/balance';

type Props = TransactionInfoBlockProps;

const NativeStakingProcessConfirmation: React.FC<Props> = (props: Props) => {
  const { processData } = props;

  const combineInfo = useMemo(() => processData.combineInfo as SummaryEarningProcessData, [processData.combineInfo]);
  const data = useMemo(() => combineInfo.data as unknown as RequestBondingSubmit, [combineInfo.data]);

  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const addressList = data.selectedValidators.map(validator => validator.address);
  const handleValidatorLabel = useMemo(() => {
    return getValidatorLabel(combineInfo.brief.chain);
  }, [combineInfo.brief.chain]);

  const { decimals, symbol } = useGetNativeTokenBasicInfo(combineInfo.brief.chain);

  const estimatedFeeValue = useMemo(() => {
    const feeComponents: CommonFeeComponent[] = processData.steps.reduce((previousValue, currentStep) => {
      return [...previousValue, ...currentStep.fee.feeComponent];
    }, [] as CommonFeeComponent[]);

    return getCurrentCurrencyTotalFee(feeComponents, assetRegistryMap, priceMap);
  }, [assetRegistryMap, priceMap, processData.steps]);

  return (
    <ConfirmationContent>
      <MetaInfo hasBackgroundWrapper spaceSize={'xs'}>
        <CommonTransactionInfo address={data.address} network={combineInfo.brief.chain} onlyReturnInnerContent />

        <MetaInfo.AccountGroup
          content={`${data.selectedValidators.length} selected ${handleValidatorLabel.toLowerCase()}`}
          addresses={addressList}
          label={data.type === StakingType.POOLED ? 'Pool' : handleValidatorLabel}
        />

        <MetaInfo.Number decimals={decimals} label={i18n.inputLabel.amount} suffix={symbol} value={data.amount} />

        <MetaInfo.Number
          decimals={0}
          label={i18n.inputLabel.estimatedFee}
          value={estimatedFeeValue}
          prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
          suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
        />
      </MetaInfo>
    </ConfirmationContent>
  );
};

export default NativeStakingProcessConfirmation;
