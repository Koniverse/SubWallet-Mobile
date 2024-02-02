import { Icon, Number, Typography } from 'components/design-system-ui';
import { CaretRight } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { YieldGroupInfo } from 'types/earning';
import { getTokenLogo } from 'utils/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';

interface Props {
  poolGroup: YieldGroupInfo;
  onPress: () => void;
  isShowBalance?: boolean;
}

const EarningGroupItem = ({ poolGroup, onPress, isShowBalance }: Props) => {
  const { maxApy, symbol, token, balance } = poolGroup;
  const theme = useSubWalletTheme().swThemes;
  const styleSheet = createStyleSheet(theme);

  return (
    <TouchableOpacity style={styleSheet.infoContainer} activeOpacity={0.5} onPress={onPress}>
      {getTokenLogo(token, undefined, 40)}
      <View style={{ flex: 1, paddingLeft: theme.paddingXS }}>
        <View style={styleSheet.containerRow}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styleSheet.groupSymbol} numberOfLines={1} ellipsizeMode={'tail'}>
              {symbol}
            </Text>
            {poolGroup.chain === 'bifrost' && (
              <Text style={styleSheet.groupChainName} numberOfLines={1} ellipsizeMode={'tail'}>
                {` (${poolGroup.name})`}
              </Text>
            )}
          </View>

          {maxApy && (
            <View style={styleSheet.dataRow}>
              <Typography.Text
                style={{
                  ...FontMedium,
                  fontSize: theme.fontSizeSM,
                  lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                  color: theme.colorTextLight4,
                }}>
                Up to
              </Typography.Text>
              <Number
                value={maxApy}
                decimal={0}
                suffix={'%'}
                textStyle={{ ...FontSemiBold, lineHeight: theme.fontSizeHeading5 * theme.lineHeightHeading5 }}
              />
            </View>
          )}
        </View>
        <View style={styleSheet.containerRow}>
          {isShowBalance ? (
            <Number
              value={balance.value}
              decimal={0}
              prefix={'Available: '}
              suffix={symbol}
              size={theme.fontSizeSM}
              intOpacity={0.45}
              decimalOpacity={0.45}
              unitOpacity={0.45}
              textStyle={{ ...FontMedium, lineHeight: theme.fontSizeSM * theme.lineHeightSM }}
            />
          ) : (
            <Typography.Text
              style={{
                ...FontMedium,
                fontSize: theme.fontSizeSM,
                lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                color: theme.colorTextLight4,
              }}>
              ******
            </Typography.Text>
          )}
          {maxApy && (
            <View style={styleSheet.dataRow}>
              <Typography.Text
                style={{
                  ...FontMedium,
                  fontSize: theme.fontSizeSM,
                  lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                  color: theme.colorSecondary,
                }}>
                per year
              </Typography.Text>
            </View>
          )}
        </View>
      </View>

      <View style={styleSheet.iconWrapper}>
        <Icon phosphorIcon={CaretRight} iconColor={theme.colorTextLight3} size={'sm'} />
      </View>
    </TouchableOpacity>
  );
};

function createStyleSheet(theme: ThemeTypes) {
  return StyleSheet.create({
    infoContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      paddingLeft: theme.paddingSM,
      paddingTop: theme.paddingSM - 1,
      paddingBottom: theme.paddingSM - 1,
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      alignItems: 'center',
    },
    containerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
      gap: theme.padding,
    },

    groupSymbol: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: theme.colorTextLight1,
    },
    groupChainName: {
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      ...FontSemiBold,
      color: theme.colorTextTertiary,
      flex: 1,
    },

    iconWrapper: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.marginXXS,
      marginRight: theme.marginXXS,
    },

    dataRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.sizeXXS,
    },
  });
}

export default React.memo(EarningGroupItem);
