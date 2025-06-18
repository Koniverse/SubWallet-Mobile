import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TransactionInfoBlockProps } from 'components/Modal/TransactionProcessDetailModal/parts/TransactionInfoBlock/types';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SwapBaseTxData } from '@subwallet/extension-base/types/swap';
import useGetAccountByAddress from 'hooks/screen/useGetAccountByAddress';
import useGetChainPrefixBySlug from 'hooks/chain/useGetChainPrefixBySlug';
import { Typography, Number } from 'components/design-system-ui';
import { _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { SwapTransactionBlock } from 'components/Swap/SwapTransactionBlock';
import MetaInfo from 'components/MetaInfo';
import i18n from 'utils/i18n/i18n';
import { getCurrentCurrencyTotalFee } from 'utils/common/balance';
import { getTokenPairFromStep } from '@subwallet/extension-base/services/swap-service/utils';

type Props = TransactionInfoBlockProps;

const Swap: React.FC<Props> = (props: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { processData } = props;

  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const data = processData.combineInfo as SwapBaseTxData;

  const recipientAddress = data.recipient || data.address;
  const recipient = useGetAccountByAddress(recipientAddress);
  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.to] || undefined;
  }, [assetRegistryMap, data.quote.pair.to]);
  const networkPrefix = useGetChainPrefixBySlug(toAssetInfo?.originChain);
  const fromAssetInfo = useMemo(() => {
    return assetRegistryMap[data.quote.pair.from] || undefined;
  }, [assetRegistryMap, data.quote.pair.from]);

  const estimatedFeeValue = useMemo(() => {
    return getCurrentCurrencyTotalFee(data.quote.feeInfo.feeComponent, assetRegistryMap, priceMap);
  }, [assetRegistryMap, data.quote.feeInfo.feeComponent, priceMap]);

  const renderRateConfirmInfo = useCallback(() => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Number size={14} value={1} decimal={0} suffix={_getAssetSymbol(fromAssetInfo)} />
        <Typography.Text style={{ color: theme.colorWhite }}>{' ~ '}</Typography.Text>
        <Number size={14} value={data.quote.rate} decimal={0} suffix={_getAssetSymbol(toAssetInfo)} />
      </View>
    );
  }, [data.quote.rate, fromAssetInfo, theme.colorWhite, toAssetInfo]);

  const originSwapPair = useMemo(() => {
    return getTokenPairFromStep(data.process.steps);
  }, [data.process.steps]);

  return (
    <>
      <MetaInfo hasBackgroundWrapper spaceSize={'xs'} labelColorScheme={'gray'} valueColorScheme={'light'}>
        <SwapTransactionBlock
          fromAmount={data.quote.fromAmount}
          fromAssetSlug={originSwapPair?.from}
          logoSize={36}
          toAmount={data.quote.toAmount}
          toAssetSlug={originSwapPair?.to}
        />
      </MetaInfo>
      <MetaInfo style={{ paddingHorizontal: 12 }} spaceSize={'xs'} labelColorScheme={'gray'} valueColorScheme={'light'}>
        <MetaInfo.Account
          address={recipientAddress}
          label={i18n.inputLabel.recipient}
          name={recipient?.name}
          networkPrefix={networkPrefix}
        />
        <MetaInfo.Default label={'Quote rate'}>{renderRateConfirmInfo()}</MetaInfo.Default>
        <MetaInfo.Number
          decimals={0}
          label={i18n.inputLabel.estimateFee}
          prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
          suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          value={estimatedFeeValue}
        />
      </MetaInfo>
    </>
  );
};

export default Swap;
