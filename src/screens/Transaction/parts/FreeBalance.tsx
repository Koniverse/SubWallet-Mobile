import React, { useEffect } from 'react';
import { useGetBalance } from 'hooks/balance';
import { StyleProp, View, ViewStyle } from 'react-native';
import { FreeBalanceDisplay } from 'screens/Transaction/parts/FreeBalanceDisplay';
import i18n from 'utils/i18n/i18n';
import { Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ExtrinsicType } from '@subwallet/extension-base/background/KoniTypes';

interface Props {
  address?: string;
  tokenSlug?: string;
  label?: string;
  chain?: string;
  onBalanceReady?: (rs: boolean) => void;
  style?: StyleProp<ViewStyle>;
  hidden?: boolean;
  isSubscribe?: boolean;
  showNetwork?: boolean;
  extrinsicType?: ExtrinsicType;
}

export const FreeBalance = ({
  address,
  chain,
  label,
  onBalanceReady,
  tokenSlug,
  style,
  hidden,
  isSubscribe,
  showNetwork,
  extrinsicType,
}: Props) => {
  const { error, isLoading, nativeTokenBalance, nativeTokenSlug, tokenBalance, chainInfo } = useGetBalance(
    chain,
    address,
    tokenSlug,
    isSubscribe,
    extrinsicType,
  );
  const theme = useSubWalletTheme().swThemes;
  useEffect(() => {
    onBalanceReady?.(!isLoading && !error);
  }, [error, isLoading, onBalanceReady]);

  if (!address && !hidden) {
    return (
      <View style={[{ marginBottom: 12 }, style]}>
        <Typography.Text style={{ color: theme.colorTextTertiary }}>
          Select account to view available balance
        </Typography.Text>
      </View>
    );
  }

  if (!address && !chain) {
    return <></>;
  }

  return (
    <FreeBalanceDisplay
      label={label || i18n.sendToken.senderAvailableBalance}
      error={error}
      isLoading={isLoading}
      nativeTokenSlug={nativeTokenSlug}
      nativeTokenBalance={nativeTokenBalance}
      style={style}
      tokenBalance={tokenBalance}
      tokenSlug={tokenSlug}
      hidden={hidden}
      chainName={chainInfo?.name}
      showNetwork={showNetwork}
    />
  );
};
