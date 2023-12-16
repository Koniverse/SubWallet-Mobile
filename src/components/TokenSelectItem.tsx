import React, { useMemo } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { getTokenLogo } from 'utils/index';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { CheckCircle } from 'phosphor-react-native';
import { Icon, Typography, Number } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { BN_ZERO } from 'utils/chainBalances';
import { TokenBalanceItemType } from 'types/balance';

interface Props extends TouchableOpacityProps {
  symbol: string;
  name: string;
  chain: string;
  logoKey: string;
  subLogoKey?: string;
  isSelected: boolean;
  onSelectNetwork: () => void;
  defaultItemKey?: string;
  iconSize?: number;
  isShowBalance?: boolean;
  tokenBalance?: TokenBalanceItemType;
}

export const TokenSelectItem = ({
  symbol,
  name,
  chain,
  logoKey,
  subLogoKey,
  isSelected,
  onSelectNetwork,
  defaultItemKey,
  iconSize = 40,
  isShowBalance = false,
  tokenBalance,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <TouchableOpacity onPress={onSelectNetwork} onPressIn={() => Keyboard.dismiss()}>
      <View style={styles.itemArea}>
        <View style={styles.itemBodyArea}>
          {getTokenLogo(logoKey, subLogoKey, iconSize, defaultItemKey)}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', flex: 1 }}>
              <Typography.Text style={styles.itemTextStyle} ellipsis>
                {symbol}
              </Typography.Text>
              <Typography.Text style={styles.itemTokenNameStyle} ellipsis>{`(${name})`}</Typography.Text>
            </View>

            <Text style={styles.subTextStyle}>{chain}</Text>
          </View>
        </View>

        {!!isShowBalance && tokenBalance && tokenBalance.isReady && (
          <View style={{ alignItems: 'flex-end' }}>
            <Number size={16} value={tokenBalance.total.value || BN_ZERO} decimal={0} />
            <Number
              prefix={'$'}
              size={12}
              unitOpacity={0.45}
              intOpacity={0.45}
              decimalOpacity={0.45}
              value={tokenBalance.total.convertedValue}
              decimal={0}
            />
          </View>
        )}

        <View style={styles.selectedIconWrapper}>
          {isSelected && <Icon phosphorIcon={CheckCircle} weight={'fill'} size={'sm'} iconColor={theme.colorSuccess} />}
        </View>
      </View>
    </TouchableOpacity>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    itemArea: {
      flexDirection: 'row',
      flex: 1,
      // justifyContent: 'space-between',
      paddingVertical: theme.paddingSM + 2,
      alignItems: 'center',
      paddingHorizontal: theme.paddingSM,
      backgroundColor: theme.colorBgSecondary,
      marginHorizontal: theme.padding,
      marginBottom: theme.marginXS,
      borderRadius: theme.borderRadiusLG,
    },

    itemBodyArea: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingRight: theme.paddingXS,
    },

    itemTextStyle: {
      paddingLeft: theme.marginXS,
      color: ColorMap.light,
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
    },

    itemTokenNameStyle: {
      paddingLeft: theme.paddingXXS,
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      flex: 1,
      ...FontSemiBold,
    },

    subTextStyle: {
      paddingLeft: theme.paddingXS,
      color: theme.colorTextTertiary,
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      ...FontMedium,
    },
    selectedIconWrapper: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: -theme.marginXS,
    },
  });
}
