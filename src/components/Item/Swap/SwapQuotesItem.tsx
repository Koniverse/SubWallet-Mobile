import React, { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Icon, Typography, Number, Web3Block } from 'components/design-system-ui';
import { CheckCircle, CircleWavyCheck } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import BigN from 'bignumber.js';
import { BN_TEN } from 'utils/chainBalances';
import { SwapQuote } from '@subwallet/extension-base/types/swap';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';

interface Props {
  isRecommend?: boolean;
  quote: SwapQuote;
  selected?: boolean;
  onSelect?: (quote: SwapQuote) => void;
  decimals: number;
  symbol: string;
}

const numberMetadata = { maxNumberFormat: 8 };

export const SwapQuotesItem = ({ isRecommend, quote, selected, onSelect, decimals, symbol }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const _onSelect = useCallback(() => {
    onSelect?.(quote);
  }, [onSelect, quote]);

  const destinationSwapValue = useMemo(() => {
    return new BigN(quote.fromAmount).div(BN_TEN.pow(decimals)).multipliedBy(quote.rate);
  }, [decimals, quote.fromAmount, quote.rate]);

  const leftItem = useMemo(() => {
    return (
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
          <Typography.Text style={{ color: theme.colorTextLight4 }}>{quote.provider.name}</Typography.Text>
          {isRecommend && (
            <Icon size={'sm'} phosphorIcon={CircleWavyCheck} weight={'fill'} iconColor={theme.colorPrimary} />
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.sizeXXS }}>
          <Typography.Text style={{ color: theme.colorTextLight4 }}>{'Est.receive'}</Typography.Text>
          <Number
            customFormatter={swapCustomFormatter}
            size={theme.fontSize}
            value={destinationSwapValue}
            decimal={0}
            suffix={symbol}
            formatType={'custom'}
            metadata={numberMetadata}
          />
        </View>
      </View>
    );
  }, [
    destinationSwapValue,
    isRecommend,
    quote.provider.name,
    symbol,
    theme.colorPrimary,
    theme.colorTextLight4,
    theme.fontSize,
    theme.sizeXXS,
  ]);

  const rightItem = useMemo(() => {
    if (!selected) {
      return null;
    }

    return <Icon phosphorIcon={CheckCircle} weight={'fill'} iconColor={theme.colorSuccess} />;
  }, [selected, theme.colorSuccess]);

  return (
    <Web3Block
      customStyle={{
        container: {
          backgroundColor: theme.colorBgSecondary,
          borderRadius: theme.borderRadiusLG,
          paddingVertical: theme.padding - 2,
        },
        right: {
          marginRight: 0,
        },
      }}
      leftItem={leftItem}
      middleItem={<></>}
      rightItem={rightItem}
      onPress={_onSelect}
    />
  );
};
