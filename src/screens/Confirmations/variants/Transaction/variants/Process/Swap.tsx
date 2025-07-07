import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BaseProcessConfirmationProps } from './Base';
import { RootState } from 'stores/index';
import { SwapBaseTxData } from '@subwallet/extension-base/types/swap';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { BN_TEN, BN_ZERO } from 'utils/chainBalances';
import BigN from 'bignumber.js';
import { ConfirmationContent } from 'components/common/Confirmation';
import { SwapTransactionBlock } from 'components/Swap/SwapTransactionBlock';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { useGetTransactionProcessSteps } from 'hooks/transaction/process';
import { getSwapChainsFromPath, getTokenPairFromStep } from '@subwallet/extension-base/services/swap-service/utils';
import { ProcessType } from '@subwallet/extension-base/types';
import QuoteRateDisplay from 'components/Swap/QuoteRateDisplay';
import useGetSwapProcessSteps from 'hooks/transaction/process/useGetSwapProcessSteps';

type Props = BaseProcessConfirmationProps;

export const SwapProcessConfirmation = ({ process }: Props) => {
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);
  const data = process.combineInfo as SwapBaseTxData;

  const recipientAddress = data.recipient || data.address;
  const recipient = useGetAccountByAddress(recipientAddress);
  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.to] || undefined;
  }, [assetRegistryMap, data.quote.pair.to]);
  const networkPrefix = useGetChainPrefixBySlug(toAssetInfo.originChain);
  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.from] || undefined;
  }, [assetRegistryMap, data.quote.pair.from]);

  const estimatedFeeValue = useMemo(() => {
    let totalBalance = BN_ZERO;

    data.quote.feeInfo.feeComponent.forEach(feeItem => {
      const asset = assetRegistryMap[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        totalBalance = totalBalance.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
      }
    });

    return totalBalance;
  }, [assetRegistryMap, data.quote.feeInfo.feeComponent, priceMap]);

  const getWaitingTime = useMemo(() => {
    return Math.ceil((data.quote.estimatedArrivalTime || 0) / 60);
  }, [data.quote.estimatedArrivalTime]);

  const getTransactionProcessSteps = useGetTransactionProcessSteps();
  const getSwapProcessSteps = useGetSwapProcessSteps();

  const stepItems = useMemo(() => {
    if (process.type === ProcessType.SWAP) {
      return getSwapProcessSteps(data.process, data.quote);
    }

    return getTransactionProcessSteps(process.steps, data, false);
  }, [process.type, process.steps, getTransactionProcessSteps, data, getSwapProcessSteps]);

  const processChains = useMemo(() => {
    return getSwapChainsFromPath(data.process.path);
  }, [data.process.path]);

  const originSwapPair = useMemo(() => {
    return getTokenPairFromStep(data.process.steps);
  }, [data.process.steps]);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;

    if (data.quote.aliveUntil) {
      timer = setInterval(() => {
        if (Date.now() > data.quote.aliveUntil) {
          setShowQuoteExpired(true);
          clearInterval(timer);
        }
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [data.quote.aliveUntil]);

  return (
    <ConfirmationContent isFullHeight>
      <SwapTransactionBlock
        fromAmount={data.quote.fromAmount}
        fromAssetSlug={originSwapPair?.from}
        toAmount={data.quote.toAmount}
        toAssetSlug={originSwapPair?.to}
      />

      <MetaInfo labelColorScheme={'gray'} valueColorScheme={'light'}>
        <MetaInfo.Account
          address={recipientAddress}
          label={i18n.inputLabel.recipient}
          name={recipient?.name}
          networkPrefix={networkPrefix}
          valueColorSchema={'light'}
        />

        <MetaInfo.Default label={'Quote rate'} valueColorSchema={'gray'}>
          <QuoteRateDisplay fromAssetInfo={fromAssetInfo} rateValue={data.quote.rate} toAssetInfo={toAssetInfo} />
        </MetaInfo.Default>

        <MetaInfo.Number
          decimals={0}
          label={i18n.inputLabel.estimatedFee}
          prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
          suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          value={estimatedFeeValue}
        />

        <MetaInfo.TransactionProcess items={stepItems} type={process.type} processChains={processChains} />

        {!showQuoteExpired && getWaitingTime > 0 && (
          <AlertBox
            title={'Pay attention!'}
            description={`Swapping via ${data.provider.name} can take up to ${getWaitingTime} minutes. Make sure you review all information carefully before submitting.`}
            type={'warning'}
          />
        )}
      </MetaInfo>

      {showQuoteExpired && (
        <AlertBox
          title={'Pay attention!'}
          description={'Swap quote expired. Cancel to get a new quote.'}
          type={'warning'}
        />
      )}
    </ConfirmationContent>
  );
};

export default SwapProcessConfirmation;
