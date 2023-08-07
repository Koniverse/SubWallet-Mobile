import React from 'react';
import { Text, View } from 'react-native';
import { Number } from 'components/design-system-ui';
import BigN from 'bignumber.js';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';

interface Props {
  label?: string;
  bondedBalance?: string | number | BigN;
  decimals: number;
  symbol: string;
}

export const BondedBalance = ({ label, bondedBalance, decimals, symbol }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
      <Number
        decimal={decimals}
        decimalColor={theme.colorTextTertiary}
        intColor={theme.colorTextTertiary}
        size={14}
        suffix={symbol}
        unitColor={theme.colorTextTertiary}
        value={bondedBalance || 0}
        textStyle={{ ...FontMedium }}
      />
      <Text
        style={{
          fontSize: theme.fontSize,
          lineHeight: theme.fontSize * theme.lineHeight,
          ...FontMedium,
          color: theme.colorTextTertiary,
          paddingLeft: theme.paddingXXS,
        }}>
        {label || i18n.stakingScreen.bonded}
      </Text>
    </View>
  );
};
