import React, { useCallback, useMemo } from 'react';
import Web3Block from '../../design-system-ui/web3-block/Web3Block';
import { Icon, Logo, Number, Typography } from 'components/design-system-ui';
import { View } from 'react-native';
import BigN from 'bignumber.js';
import { CheckCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { swapCustomFormatter } from '@subwallet/extension-base/utils';
import { FontSemiBold } from 'styles/sharedStyles';

interface Props {
  value?: string | number | BigN;
  tokenSlug: string;
  symbol: string;
  selected?: boolean;
  onSelect?: (slug: string) => void;
}

const numberMetadata = { maxNumberFormat: 8 };

export const ChooseFeeItem = ({ tokenSlug, value, symbol, selected, onSelect }: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const _onSelect = useCallback(() => {
    onSelect?.(tokenSlug);
  }, [onSelect, tokenSlug]);

  const leftItem = <Logo size={40} token={tokenSlug.toLowerCase()} />;

  const middleItem = useMemo(
    () => (
      <View>
        {value ? (
          <Number
            customFormatter={swapCustomFormatter}
            style={{ paddingBottom: 4 }}
            value={value}
            decimal={0}
            suffix={symbol}
            formatType={'custom'}
            metadata={numberMetadata}
          />
        ) : (
          <Typography.Text size={'md'} style={{ color: theme.colorWhite, ...FontSemiBold }}>
            {symbol}
          </Typography.Text>
        )}
      </View>
    ),
    [symbol, theme.colorWhite, value],
  );

  const rightItem = useMemo(() => {
    return (
      <>{selected && <Icon phosphorIcon={CheckCircle} size={'sm'} iconColor={theme.colorSuccess} weight={'fill'} />}</>
    );
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
      middleItem={middleItem}
      rightItem={rightItem}
      onPress={_onSelect}
    />
  );
};
