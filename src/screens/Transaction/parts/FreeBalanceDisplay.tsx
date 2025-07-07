import React, { useCallback, useState } from 'react';
import { Platform, StatusBar, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ActivityIndicator, Icon, Number, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FontMedium } from 'styles/sharedStyles';
import { AmountData } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';
import { ThemeTypes } from 'styles/themes';
import Tooltip from 'react-native-walkthrough-tooltip';
import { Info } from 'phosphor-react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';

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
  labelTooltip?: string;
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
  labelTooltip,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);
  const [tooltipVisible, setTooltipVisible] = useState(false);

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
        <Tooltip
          isVisible={tooltipVisible}
          disableShadow={true}
          placement={'bottom'}
          showChildInTooltip={false}
          topAdjustment={Platform.OS === 'android' ? (StatusBar.currentHeight ? -StatusBar.currentHeight : 0) : 0}
          contentStyle={{ backgroundColor: theme.colorBgSpotlight, borderRadius: theme.borderRadiusLG }}
          closeOnBackgroundInteraction={true}
          onClose={() => setTooltipVisible(false)}
          content={
            <Typography.Text style={{ color: theme.colorWhite, textAlign: 'center' }}>
              {labelTooltip || ''}
            </Typography.Text>
          }>
          <TouchableOpacity
            activeOpacity={!!labelTooltip ? BUTTON_ACTIVE_OPACITY : 1}
            onPress={() => {
              if (!!labelTooltip) {
                setTooltipVisible(true);
              }
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
            <Typography.Text style={[styles.text]}>
              {label || `${i18n.sendToken.senderAvailableBalance}`}
            </Typography.Text>

            {!!labelTooltip && (
              <View style={{ paddingTop: 2, paddingLeft: theme.paddingXXS }}>
                <Icon phosphorIcon={Info} customSize={14} iconColor={theme['gray-5']} />
              </View>
            )}

            <Typography.Text style={styles.text}>{': '}</Typography.Text>
          </TouchableOpacity>
        </Tooltip>
      )}
      {isLoading && <ActivityIndicator size={14} indicatorColor={theme['gray-5']} />}
      {error && (
        <Typography.Text ellipsis style={styles.errorText}>
          {error}
        </Typography.Text>
      )}
      {!isLoading && !error && !!nativeTokenSlug && nativeTokenBalance && (
        <Number
          decimal={nativeTokenBalance.decimals || 18}
          decimalColor={theme['gray-5']}
          intColor={theme['gray-5']}
          size={14}
          textStyle={{ ...FontMedium }}
          suffix={renderSuffix(nativeTokenBalance)}
          unitColor={theme['gray-5']}
          value={nativeTokenBalance.value}
        />
      )}
      {!isLoading && !error && !!tokenSlug && tokenSlug !== nativeTokenSlug && !!tokenBalance && (
        <>
          <Typography.Text style={styles.text}>{' and '}</Typography.Text>
          <Number
            decimal={tokenBalance.decimals || 18}
            decimalColor={theme['gray-5']}
            intColor={theme['gray-5']}
            size={14}
            textStyle={{ ...FontMedium }}
            suffix={renderSuffix(tokenBalance)}
            unitColor={theme['gray-5']}
            value={tokenBalance.value}
          />
        </>
      )}
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    text: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme['gray-5'],
      ...FontMedium,
    },
    errorText: {
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      color: theme.colorError,
      ...FontMedium,
    },
  });
}
