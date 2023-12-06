import React, { useEffect } from 'react';
import { useGetBalance } from 'hooks/balance';
import { StyleProp, View, ViewStyle } from 'react-native';
import { FreeBalanceDisplay } from 'screens/Transaction/parts/FreeBalanceDisplay';
import i18n from 'utils/i18n/i18n';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Typography } from 'components/design-system-ui';

interface Props {
  address?: string;
  tokenSlug?: string;
  chain?: string;
  onBalanceReady?: (rs: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export const GeneralFreeBalance = ({ address, chain, onBalanceReady, tokenSlug, style }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const { error, isLoading, nativeTokenBalance, nativeTokenSlug, tokenBalance } = useGetBalance(
    chain,
    address,
    tokenSlug,
  );

  useEffect(() => {
    onBalanceReady?.(!isLoading && !error);
  }, [error, isLoading, onBalanceReady]);

  if (!address && !chain) {
    return <></>;
  }

  //todo: i18n this
  if (!address) {
    return (
      <View style={[{ marginBottom: 12 }, style]}>
        <Typography.Text style={{ color: theme.colorTextTertiary }}>
          Select account to view available balance
        </Typography.Text>
      </View>
    );
  }

  return (
    <FreeBalanceDisplay
      label={`${i18n.inputLabel.availableBalance}:`}
      error={error}
      isLoading={isLoading}
      nativeTokenSlug={nativeTokenSlug}
      nativeTokenBalance={nativeTokenBalance}
      style={style}
      tokenBalance={tokenBalance}
      tokenSlug={tokenSlug}
    />
  );
};
