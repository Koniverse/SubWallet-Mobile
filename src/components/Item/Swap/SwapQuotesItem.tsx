import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Icon, Typography, Web3Block, Logo, NumberDisplay, Tag } from 'components/design-system-ui';
import { CheckCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { SwapQuote } from '@subwallet/extension-base/types/swap';
import { swapNumberMetadata } from '@subwallet/extension-base/utils';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BN_ZERO, BN_TEN } from 'utils/chainBalances';
import BigN from 'bignumber.js';
import { _getAssetDecimals, _getAssetSymbol } from '@subwallet/extension-base/services/chain-service/utils';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props {
  isRecommend?: boolean;
  quote: SwapQuote;
  selected?: boolean;
  onSelect?: (quote: SwapQuote) => void;
}

export const SwapQuotesItem = ({ isRecommend, quote, selected, onSelect }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { currencyData, priceMap } = useSelector((state: RootState) => state.price);
  const assetRegistryMap = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  const _onSelect = useCallback(() => {
    onSelect?.(quote);
  }, [onSelect, quote]);

  const toAssetInfo = useMemo(() => {
    return assetRegistryMap[quote.pair.to] || undefined;
  }, [assetRegistryMap, quote.pair.to]);

  const estimatedFeeValue = useMemo(() => {
    let totalBalance = BN_ZERO;

    quote.feeInfo.feeComponent.forEach(feeItem => {
      const asset = assetRegistryMap[feeItem.tokenSlug];

      if (asset) {
        const { decimals, priceId } = asset;
        const price = priceMap[priceId || ''] || 0;

        totalBalance = totalBalance.plus(new BigN(feeItem.amount).div(BN_TEN.pow(decimals || 0)).multipliedBy(price));
      }
    });

    return totalBalance;
  }, [assetRegistryMap, quote.feeInfo.feeComponent, priceMap]);

  const leftItem = useMemo(() => {
    return <Logo size={24} isShowSubLogo={false} network={quote.provider.id.toLowerCase()} shape={'circle'} />;
  }, [quote.provider.id]);

  const middleItem = useMemo(
    () => (
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
          <Typography.Text size={'md'} style={{ color: theme.colorTextLight4, ...FontSemiBold }}>
            {quote.provider.name}
          </Typography.Text>
          {isRecommend && <Tag bgType={'default'}>{'Best'}</Tag>}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS, flex: 1 }}>
          <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4, flex: 1 }}>
            {'Est.receive'}
          </Typography.Text>
          <NumberDisplay
            style={{ flex: 1 }}
            size={12}
            value={quote.toAmount || '0'}
            suffix={_getAssetSymbol(toAssetInfo)}
            metadata={swapNumberMetadata}
            decimal={_getAssetDecimals(toAssetInfo)}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
          <Typography.Text size={'sm'} style={{ color: theme.colorTextLight4, flex: 1 }}>
            {'Fee'}
          </Typography.Text>
          <NumberDisplay
            style={{ flex: 1 }}
            size={12}
            value={estimatedFeeValue}
            decimal={0}
            metadata={swapNumberMetadata}
            prefix={(currencyData.isPrefix && currencyData.symbol) || ''}
            suffix={(!currencyData.isPrefix && currencyData.symbol) || ''}
          />
        </View>

        {/*<View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>*/}
        {/*  <Typography.Text style={{ color: theme.colorTextLight4 }}>{'Process'}</Typography.Text>*/}
        {/*  <TransactionProcessPreview chains={[]} />*/}
        {/*</View>*/}
      </View>
    ),
    [
      currencyData.isPrefix,
      currencyData.symbol,
      estimatedFeeValue,
      isRecommend,
      quote.provider.name,
      quote.toAmount,
      theme.colorTextLight4,
      theme.sizeXXS,
      toAssetInfo,
    ],
  );

  const rightItem = useMemo(() => {
    if (!selected) {
      return <View style={{ width: 20 }} />;
    }

    return <Icon size={'sm'} phosphorIcon={CheckCircle} weight={'fill'} iconColor={theme.colorSuccess} />;
  }, [selected, theme.colorSuccess]);

  return (
    <Web3Block
      customStyle={{
        container: {
          backgroundColor: theme.colorBgSecondary,
          borderRadius: theme.borderRadiusLG,
          paddingVertical: theme.padding - 2,
          alignItems: 'flex-start',
        },
        right: {
          marginRight: 0,
        },
      }}
      leftItem={leftItem}
      middleItem={middleItem}
      rightItem={rightItem}
      onPress={_onSelect}
    />
  );
};
