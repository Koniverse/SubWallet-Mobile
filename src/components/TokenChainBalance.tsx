import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { getNetworkLogo, toShort } from 'utils/index';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { TokenBalanceItemType } from 'types/balance';
import { BN_ZERO } from 'utils/chainBalances';
import { Icon, Number } from 'components/design-system-ui';
import { CaretRight } from 'phosphor-react-native';

interface Props extends TokenBalanceItemType, TouchableOpacityProps {}

const chainBalanceMainArea: StyleProp<any> = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  paddingTop: 16,
  paddingBottom: 16,
};
const chainBalancePart1: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingLeft: 16,
  paddingRight: 2,
};
const textStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontMedium,
  color: ColorMap.light,
  paddingBottom: 4,
};
const subTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};
const priceStyle: StyleProp<any> = {
  ...subTextStyle,
  color: ColorMap.primary,
};
const chainBalanceMetaWrapper: StyleProp<any> = {
  paddingLeft: 16,
};
const chainBalancePart2: StyleProp<any> = {
  alignItems: 'flex-end',
  paddingRight: 16,
  paddingLeft: 2,
};
const chainBalancePart2Wrapper: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingRight: 15,
};

export const TokenChainBalance = ({
  networkKey,
  networkDisplayName,
  logoKey,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  symbol,
  displayedSymbol,
  balanceValue,
  convertedBalanceValue,
  isReady,
  isTestnet,
  priceValue,
  ...wrapperProps
}: Props) => {
  return (
    <TouchableOpacity style={{ width: '100%' }} {...wrapperProps}>
      <View style={chainBalanceMainArea}>
        <View style={chainBalancePart1}>
          {getNetworkLogo(logoKey, 40, networkKey)}
          <View style={chainBalanceMetaWrapper}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Text style={textStyle}>{toShort(displayedSymbol, 5, 5)}</Text>
              {!!networkDisplayName && (
                <>
                  <Text style={textStyle}> (</Text>
                  <Text style={[textStyle, { maxWidth: 100 }]} numberOfLines={1}>
                    {networkDisplayName}
                  </Text>
                  <Text style={textStyle}>)</Text>
                </>
              )}
            </View>

            <Number
              value={isTestnet ? 0 : priceValue}
              decimal={0}
              prefix={'$'}
              intColor={priceStyle.color}
              decimalColor={priceStyle.color}
              size={priceStyle.fontSize}
            />
          </View>
        </View>

        <View style={chainBalancePart2Wrapper}>
          <View style={chainBalancePart2}>
            <Number
              value={!isReady ? BN_ZERO : balanceValue}
              decimal={0}
              decimalOpacity={0.45}
              intColor={textStyle.color}
              decimalColor={textStyle.color}
              size={textStyle.fontSize}
            />
            <Number
              value={isTestnet || !isReady ? BN_ZERO : convertedBalanceValue}
              decimal={0}
              decimalOpacity={0.45}
              prefix={'$'}
              intColor={subTextStyle.color}
              decimalColor={subTextStyle.color}
              size={subTextStyle.fontSize}
            />
          </View>
          <Icon type="phosphor" phosphorIcon={CaretRight} size={'xs'} iconColor="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
