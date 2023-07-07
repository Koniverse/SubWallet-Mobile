import React, { useEffect } from 'react';
import { useGetBalance } from 'hooks/balance';
import { StyleProp, ViewStyle } from 'react-native';
import { FreeBalanceDisplay } from 'screens/Transaction/parts/FreeBalanceDisplay';
import i18n from 'utils/i18n/i18n';

interface Props {
  address?: string;
  tokenSlug?: string;
  label?: string;
  chain?: string;
  onBalanceReady?: (rs: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export const FreeBalance = ({ address, chain, label, onBalanceReady, tokenSlug, style }: Props) => {
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
    />
  );
};
