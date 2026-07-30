import React, { useMemo, useState } from 'react';
import { Platform, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { InfoIcon } from 'phosphor-react-native';
import BigN from 'bignumber.js';
import { Icon, Typography } from 'components/design-system-ui';
import MetaInfo from 'components/MetaInfo';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { LockedBalanceDetails as LockedBalanceDetailsType } from 'types/balance';
import i18n from 'utils/i18n/i18n';

interface Props {
  details?: LockedBalanceDetailsType;
  decimals: number;
  symbol: string;
}

export const hasLockedBalanceDetails = (details?: LockedBalanceDetailsType) => {
  return !!details && Object.values(details).some(value => new BigN(value || 0).gt(0));
};

export const LockedBalanceDetails = ({ details, decimals, symbol }: Props) => {
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

  return (
    <MetaInfo style={styles.container} labelColorScheme={'gray'} spaceSize={'xs'}>
      {items.map(({ key, label }) => {
        const value = details[key] || '0';

        if (new BigN(value).lte(0)) {
          return null;
        }

        const labelNode =
          key === 'others' ? (
            <Tooltip
              isVisible={tooltipVisible}
              disableShadow
              placement={'bottom'}
              showChildInTooltip={false}
              topAdjustment={Platform.OS === 'android' ? -(StatusBar.currentHeight || 0) : 0}
              contentStyle={styles.tooltipContent}
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
          <MetaInfo.Number
            decimals={decimals}
            key={key}
            label={labelNode}
            suffix={symbol}
            unitColor={theme['gray-5']}
            value={value}
            valueColorSchema={'gray'}
          />
        );
      })}
    </MetaInfo>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      marginTop: theme.marginXXS,
      paddingLeft: theme.paddingSM,
    },
    label: {
      color: theme['gray-5'],
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
    tooltipText: {
      color: theme.colorWhite,
      textAlign: 'center',
    },
  });
}
