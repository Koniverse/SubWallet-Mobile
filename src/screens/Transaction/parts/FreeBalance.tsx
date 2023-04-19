import React, { useEffect } from 'react';
import { useGetBalance } from 'hooks/balance';
import { Text, View } from 'react-native';
import { Number } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';

interface Props {
  address?: string;
  tokenSlug?: string;
  label?: string;
  chain?: string;
  onBalanceReady?: (rs: boolean) => void;
}

export const FreeBalance = ({ address, chain, label, onBalanceReady, tokenSlug }: Props) => {
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

  return (
    <View style={{ flexDirection: 'row', marginBottom: 12 }}>
      <Text style={{ fontSize: 14, lineHeight: 22, color: theme.colorTextTertiary, ...FontMedium, paddingRight: 4 }}>
        {label || 'Sender available balance:'}
      </Text>
      {!!nativeTokenSlug && (
        <Number
          decimal={nativeTokenBalance.decimals || 18}
          decimalColor={theme.colorTextTertiary}
          intColor={theme.colorTextTertiary}
          size={14}
          textStyle={{ ...FontMedium }}
          suffix={nativeTokenBalance.symbol}
          unitColor={theme.colorTextTertiary}
          value={nativeTokenBalance.value}
        />
      )}
      {!!(tokenSlug && tokenSlug !== nativeTokenSlug) && (
        <>
          <Text style={{ fontSize: 14, lineHeight: 22, color: theme.colorTextTertiary, ...FontMedium }}>{' and '}</Text>
          <Number
            decimal={tokenBalance?.decimals || 18}
            decimalColor={theme.colorTextTertiary}
            intColor={theme.colorTextTertiary}
            size={14}
            textStyle={{ ...FontMedium }}
            suffix={tokenBalance?.symbol}
            unitColor={theme.colorTextTertiary}
            value={tokenBalance.value}
          />
        </>
      )}
    </View>
  );
};
