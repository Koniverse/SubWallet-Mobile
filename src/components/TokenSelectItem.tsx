import React, { useMemo } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { getTokenLogo } from 'utils/index';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { Typography, Number } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { TokenSelectorItemType } from './Modal/common/TokenSelector';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

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
  balanceInfo?: TokenSelectorItemType['balanceInfo'];
  showBalance?: boolean;
}

export const TokenSelectItem = ({
  symbol,
  name,
  chain,
  logoKey,
  subLogoKey,
  onSelectNetwork,
  defaultItemKey,
  iconSize = 40,
  balanceInfo,
  showBalance,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);

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

        {showBalance && (
          <View>
            {!!balanceInfo && balanceInfo.isReady && !balanceInfo.isNotSupport ? (
              <>
                {isShowBalance ? (
                  <View style={{ alignItems: 'flex-end' }}>
                    <Number value={balanceInfo.free.value} decimal={0} decimalOpacity={0.45} />
                    <Number
                      decimal={0}
                      decimalOpacity={0.45}
                      intOpacity={0.45}
                      prefix={(balanceInfo.currency?.isPrefix && balanceInfo.currency.symbol) || ''}
                      suffix={(!balanceInfo.currency?.isPrefix && balanceInfo.currency?.symbol) || ''}
                      unitOpacity={0.45}
                      value={balanceInfo.free.convertedValue}
                      size={theme.fontSizeSM}
                    />
                  </View>
                ) : (
                  <View>
                    <Typography.Text
                      style={{
                        fontSize: theme.fontSizeLG,
                        ...FontSemiBold,
                        lineHeight: theme.lineHeightLG * theme.fontSizeLG,
                        color: theme.colorTextLight1,
                      }}>
                      ******
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        ...FontMedium,
                        fontSize: theme.fontSizeSM,
                        lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                        color: theme.colorTextLight4,
                      }}>
                      ******
                    </Typography.Text>
                  </View>
                )}
              </>
            ) : (
              <View style={{ alignItems: 'flex-end' }}>
                <Typography.Text
                  style={{
                    fontSize: theme.fontSizeLG,
                    ...FontSemiBold,
                    lineHeight: theme.lineHeightLG * theme.fontSizeLG,
                    color: theme.colorTextLight1,
                  }}>
                  --
                </Typography.Text>
                <Typography.Text
                  style={{
                    ...FontMedium,
                    fontSize: theme.fontSizeSM,
                    lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                    color: theme.colorTextLight4,
                  }}>
                  --
                </Typography.Text>
              </View>
            )}
          </View>
        )}
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
