import React, { useMemo } from 'react';
import { TransactionInfoBlockProps } from 'components/Modal/TransactionProcessDetailModal/parts/TransactionInfoBlock/types';
import { SubmitYieldStepData, SummaryEarningProcessData } from '@subwallet/extension-base/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { CommonFeeComponent } from '@subwallet/extension-base/types/service-base';
import MetaInfo from 'components/MetaInfo';
import { CommonTransactionInfo } from 'components/common/Confirmation/CommonTransactionInfo';
import i18n from 'utils/i18n/i18n';
import { getCurrentCurrencyTotalFee } from 'utils/common/balance';

type Props = TransactionInfoBlockProps;

const YieldProcessConfirmation: React.FC<Props> = (props: Props) => {
  const { processData } = props;
  const combineInfo = useMemo(() => processData.combineInfo as SummaryEarningProcessData, [processData.combineInfo]);
  const txParams = useMemo(() => combineInfo.data as unknown as SubmitYieldStepData, [combineInfo.data]);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const { inputTokenDecimals, inputTokenSymbol } = useMemo(() => {
    const inputTokenInfo = assetRegistryMap[txParams.inputTokenSlug];

    return {
      inputTokenSymbol: _getAssetSymbol(inputTokenInfo),
      inputTokenDecimals: _getAssetDecimals(inputTokenInfo),
    };
  }, [assetRegistryMap, txParams.inputTokenSlug]);

  const derivativeTokenBasicInfo = useMemo(() => {
    if (!txParams.derivativeTokenSlug) {
      return;
    }

    const derivativeTokenInfo = assetRegistryMap[txParams.derivativeTokenSlug];

    return {
      symbol: _getAssetSymbol(derivativeTokenInfo),
      decimals: _getAssetDecimals(derivativeTokenInfo),
    };
  }, [txParams.derivativeTokenSlug, assetRegistryMap]);

  const estimatedReceivables = useMemo(() => {
    return Math.floor(parseInt(txParams.amount) / txParams.exchangeRate);
  }, [txParams.amount, txParams.exchangeRate]);

  const estimatedFeeValue = useMemo(() => {
    const feeComponents: CommonFeeComponent[] = processData.steps.reduce((previousValue, currentStep) => {
      return [...previousValue, ...currentStep.fee.feeComponent];
    }, [] as CommonFeeComponent[]);

    return getCurrentCurrencyTotalFee(feeComponents, assetRegistryMap, priceMap);
  }, [assetRegistryMap, priceMap, processData.steps]);

  return (
    <MetaInfo style={{ paddingHorizontal: 12 }} spaceSize={'xs'} labelColorScheme={'gray'} valueColorScheme={'light'}>
      <CommonTransactionInfo address={txParams.address} network={combineInfo.brief.chain} onlyReturnInnerContent />

      <MetaInfo.Number
        decimals={inputTokenDecimals}
        label={i18n.inputLabel.amount}
        suffix={inputTokenSymbol}
        value={txParams.amount}
      />

      {!!derivativeTokenBasicInfo && (
        <MetaInfo.Number
          decimals={derivativeTokenBasicInfo.decimals}
          label={'Estimated receivables'}
          suffix={derivativeTokenBasicInfo.symbol}
          value={estimatedReceivables.toString()}
        />
      )}

      <MetaInfo.Number
        decimals={0}
        label={i18n.inputLabel.estimatedFee}
        value={estimatedFeeValue}
        prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
        suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
      />
    </MetaInfo>
  );
};

export default YieldProcessConfirmation;
