import { ConfirmationContent } from 'components/common/Confirmation';
import MetaInfo from 'components/MetaInfo';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

import { BaseTransactionConfirmationProps } from './Base';
import { SwapStepType, SwapTxData } from '@subwallet/extension-base/types/swap';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { BN_TEN, BN_ZERO } from 'utils/chainBalances';
import BigN from 'bignumber.js';
import { _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { View } from 'react-native';
import { Number, Typography } from 'components/design-system-ui';
import AlertBox from 'components/design-system-ui/alert-box/simple';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapTransactionBlock } from 'components/Swap/SwapTransactionBlock';
import { SwapRoute } from 'components/Swap/SwapRoute';

type Props = BaseTransactionConfirmationProps;

const SwapTransactionConfirmation: React.FC<Props> = (props: Props) => {
  const { transaction } = props;
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const data = transaction.data as SwapTxData;
  const [showQuoteExpired, setShowQuoteExpired] = useState<boolean>(false);
  const recipientAddress = data.recipient || data.address;
  const account = useGetAccountByAddress(recipientAddress);
  const theme = useSubWalletTheme().swThemes;

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.to] || undefined;
  }, [assetRegistryMap, data.quote.pair.to]);
  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.from] || undefined;
  }, [assetRegistryMap, data.quote.pair.from]);

  const networkPrefix = useGetChainPrefixBySlug(toAssetInfo.originChain);

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

  const renderRateConfirmInfo = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Number decimal={0} suffix={_getAssetSymbol(fromAssetInfo)} value={1} />
        <Typography.Text style={{ color: theme.colorWhite }}>{' ~ '}</Typography.Text>
        <Number decimal={0} suffix={_getAssetSymbol(toAssetInfo)} value={data.quote.rate} />
      </View>
    );
  };

  const isSwapXCM = useMemo(() => {
    return data.process.steps.some(item => item.type === SwapStepType.XCM);
  }, [data.process.steps]);

  const getWaitingTime = useMemo(() => {
    return Math.ceil((data.quote.estimatedArrivalTime || 0) / 60);
  }, [data.quote.estimatedArrivalTime]);

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
      <SwapTransactionBlock data={data} />
      <MetaInfo style={{ paddingHorizontal: theme.paddingXS }}>
        <MetaInfo.Account
          address={recipientAddress}
          label={'Recipient'}
          networkPrefix={networkPrefix}
          name={account?.name}
        />
        <MetaInfo.Default label={'Quote rate'} valueColorSchema={'gray'}>
          {renderRateConfirmInfo()}
        </MetaInfo.Default>
        <MetaInfo.Number
          valueColorSchema={'light'}
          decimals={0}
          label={'Estimated transaction fee'}
          prefix={currencyData?.symbol}
          value={estimatedFeeValue}
        />
        <MetaInfo.Default label={'Swap route'} />
        <SwapRoute swapRoute={data.quote.route} />
      </MetaInfo>
      {!showQuoteExpired && getWaitingTime > 0 && (
        <AlertBox
          type={'warning'}
          description={`Swapping via ${data.provider.name} can take up to ${getWaitingTime} minutes. Make sure you review all information carefully before submitting.`}
          title={'Pay attention!'}
        />
      )}
      {!showQuoteExpired && isSwapXCM && (
        <AlertBox
          description={
            'The swap quote has been updated. Make sure to double-check all information before confirming the transaction.'
          }
          title={'Pay attention!'}
          type={'warning'}
        />
      )}
      {showQuoteExpired && (
        <AlertBox
          description={'Swap quote expired. Cancel to get a new quote.'}
          title={'Pay attention!'}
          type={'warning'}
        />
      )}
    </ConfirmationContent>
  );
};

export default SwapTransactionConfirmation;
