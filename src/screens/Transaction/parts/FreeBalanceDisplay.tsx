import React, { useCallback } from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';
import { ActivityIndicator, Number, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';
import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';

interface Props {
  error: string | null;
  label?: string;
  style?: StyleProp<ViewStyle>;
  nativeTokenSlug?: string;
  nativeTokenBalance?: AmountData;
  tokenSlug?: string;
  chainName?: string;
  tokenBalance?: AmountData;
  isLoading: boolean;
  hidden?: boolean;
  showNetwork?: boolean;
}

export const FreeBalanceDisplay = ({
  label,
  tokenSlug,
  style,
  error,
  isLoading,
  tokenBalance,
  nativeTokenSlug,
  nativeTokenBalance,
  hidden,
  showNetwork,
  chainName,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;

  const renderSuffix = useCallback(
    (data: AmountData) => {
      if (showNetwork) {
        return `${data.symbol} (${chainName})`;
      }

      return data.symbol;
    },
    [chainName, showNetwork],
  );

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          marginBottom: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
          display: hidden ? 'none' : 'flex',
        },
        style,
      ]}>
      {!error && (
        <Text style={{ fontSize: 14, lineHeight: 22, color: theme.colorTextTertiary, ...FontMedium, paddingRight: 4 }}>
          {label || `${i18n.sendToken.senderAvailableBalance}:`}
        </Text>
      )}
      {isLoading && <ActivityIndicator size={14} indicatorColor={theme.colorTextTertiary} />}
      {error && (
        <Typography.Text ellipsis style={{ fontSize: 14, lineHeight: 22, color: theme.colorError, ...FontMedium }}>
          {error}
        </Typography.Text>
      )}
      {!isLoading && !error && !!nativeTokenSlug && nativeTokenBalance && (
        <Number
          decimal={nativeTokenBalance.decimals || 18}
          decimalColor={theme.colorTextTertiary}
          intColor={theme.colorTextTertiary}
          size={14}
          textStyle={{ ...FontMedium }}
          suffix={renderSuffix(nativeTokenBalance)}
          unitColor={theme.colorTextTertiary}
          value={nativeTokenBalance.value}
        />
      )}
      {!isLoading && !error && !!tokenSlug && tokenSlug !== nativeTokenSlug && !!tokenBalance && (
        <>
          <Text style={{ fontSize: 14, lineHeight: 22, color: theme.colorTextTertiary, ...FontMedium }}>{' and '}</Text>
          <Number
            decimal={tokenBalance.decimals || 18}
            decimalColor={theme.colorTextTertiary}
            intColor={theme.colorTextTertiary}
            size={14}
            textStyle={{ ...FontMedium }}
            suffix={renderSuffix(tokenBalance)}
            unitColor={theme.colorTextTertiary}
            value={tokenBalance.value}
          />
        </>
      )}
    </View>
  );
};
