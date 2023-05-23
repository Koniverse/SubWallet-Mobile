import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { TokenBalanceItemType } from 'types/balance';
import { BN_ZERO } from 'utils/chainBalances';
import { Icon, Logo, Number, Typography } from 'components/design-system-ui';
import { DotsThree } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import TokenBalanceItemStyles from './style';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';

interface Props extends TokenBalanceItemType, TouchableOpacityProps {
  isShowBalance?: boolean;
}

export const TokenBalanceItem = ({
  symbol,
  isTestnet,
  chainDisplayName,
  isReady,
  total,
  chain,
  isShowBalance,
  ...wrapperProps
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = TokenBalanceItemStyles(theme);

  return (
    <TouchableOpacity style={{ width: '100%' }} {...wrapperProps}>
      <View style={_style.chainBalanceMainArea}>
        <View style={_style.chainBalancePart1}>
          <Logo size={40} token={symbol.toLowerCase()} isShowSubLogo subNetwork={chain} />
        </View>

        <View style={_style.chainBalanceMetaWrapper}>
          <Text style={_style.symbolStyle} numberOfLines={1}>
            {symbol}
          </Text>
          <Text style={_style.chainNameStyle} numberOfLines={1}>
            {chainDisplayName?.replace(' Relay Chain', '')}
          </Text>
        </View>

        <View style={_style.chainBalancePart2Wrapper}>
          <View style={_style.chainBalancePart2}>
            {isShowBalance && (
              <>
                <Number
                  style={{ paddingBottom: 4 }}
                  value={!isReady ? BN_ZERO : total.value}
                  decimal={0}
                  decimalOpacity={0.45}
                  size={theme.fontSizeLG}
                  textStyle={{ ...FontSemiBold, lineHeight: theme.lineHeightLG * theme.fontSizeLG }}
                />
                <Number
                  value={isTestnet || !isReady ? BN_ZERO : total.convertedValue}
                  decimal={0}
                  intOpacity={0.45}
                  unitOpacity={0.45}
                  decimalOpacity={0.45}
                  prefix={'$'}
                  size={theme.fontSizeSM}
                  textStyle={{ ...FontMedium, lineHeight: theme.lineHeightSM * theme.fontSizeSM }}
                />
              </>
            )}

            {!isShowBalance && (
              <>
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
                    color: theme.colorTextLight4,
                    lineHeight: theme.lineHeightSM * theme.fontSizeSM,
                  }}>
                  ******
                </Typography.Text>
              </>
            )}
          </View>
          <View style={_style.iconWrapper}>
            <Icon
              type="phosphor"
              weight={'bold'}
              phosphorIcon={DotsThree}
              size={'sm'}
              iconColor={theme.colorTextLight3}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
