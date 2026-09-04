import React, { useMemo, useState } from 'react';
import { Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { InfoIcon } from 'phosphor-react-native';
import BigN from 'bignumber.js';
import { Icon, Number, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { LockedBalanceDetails as LockedBalanceDetailsType } from 'types/balance';
import i18n from 'utils/i18n/i18n';

interface Props {
  details?: LockedBalanceDetailsType;
  decimals: number;
  symbol: string;
  withBackground?: boolean;
}

export const hasLockedBalanceDetails = (details?: LockedBalanceDetailsType) => {
  return !!details && Object.values(details).some(value => new BigN(value || 0).gt(0));
};

export const LockedBalanceDetails = ({ details, decimals, symbol, withBackground = false }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  if (!details) {
    return null;
  }

  const items = [
    { key: 'staking', label: i18n.tokenDetail.staking },
    { key: 'governance', label: i18n.tokenDetail.governance },
    { key: 'democracy', label: i18n.tokenDetail.democracy },
    { key: 'reserved', label: i18n.tokenDetail.reserved },
    { key: 'others', label: i18n.tokenDetail.others },
  ] as const;
  const visibleItems = items.filter(({ key }) => new BigN(details[key] || 0).gt(0));

  return (
    <View style={[styles.container, withBackground && styles.containerWithBackground]}>
      {visibleItems.map(({ key, label }, index) => {
        const value = details[key] || '0';

        const labelNode =
          key === 'others' ? (
            <Tooltip
              isVisible={tooltipVisible}
              disableShadow
              placement={'top'}
              showChildInTooltip={false}
              topAdjustment={Platform.OS === 'android' ? -(StatusBar.currentHeight || 0) : 0}
              contentStyle={styles.tooltipContent}
              parentWrapperStyle={styles.tooltipWrapper}
              closeOnBackgroundInteraction
              onClose={() => setTooltipVisible(false)}
              content={<Typography.Text style={styles.tooltipText}>{i18n.tokenDetail.othersTooltip}</Typography.Text>}>
              <TouchableOpacity style={styles.tooltipLabel} onPress={() => setTooltipVisible(true)}>
                <Typography.Text style={styles.label}>{label}</Typography.Text>
                <Icon phosphorIcon={InfoIcon} size={'xs'} iconColor={theme['gray-5']} weight={'bold'} />
              </TouchableOpacity>
            </Tooltip>
          ) : (
            label
          );

        return (
          <View key={key} style={[styles.row, index !== visibleItems.length - 1 && styles.rowWithMargin]}>
            <View style={styles.labelWrapper}>
              {typeof labelNode === 'string' ? <Typography.Text style={styles.label}>{labelNode}</Typography.Text> : labelNode}
            </View>
            <Number
              style={styles.value}
              decimal={decimals}
              decimalOpacity={0.45}
              intOpacity={0.85}
              size={14}
              suffix={symbol}
              unitOpacity={0.85}
              value={value}
            />
          </View>
        );
      })}
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      marginTop: theme.marginXXS,
      paddingLeft: theme.paddingSM,
      paddingRight: theme.paddingSM,
    },
    containerWithBackground: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      marginTop: 0,
      padding: theme.paddingSM,
    },
    label: {
      color: theme.colorTextTertiary,
    },
    labelWrapper: {
      flex: 1,
      paddingRight: theme.paddingSM,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    rowWithMargin: {
      marginBottom: theme.margin,
    },
    value: {
      justifyContent: 'flex-end',
    },
    tooltipContent: {
      backgroundColor: theme.colorBgSpotlight,
      borderRadius: theme.borderRadiusLG,
      maxWidth: 240,
    },
    tooltipLabel: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.paddingXXS,
    },
    tooltipWrapper: {
      alignSelf: 'flex-start',
    },
    tooltipText: {
      color: theme.colorWhite,
      textAlign: 'center',
    },
  });
}
