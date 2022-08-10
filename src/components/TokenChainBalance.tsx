import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { getNetworkLogo } from 'utils/index';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { BalanceVal } from 'components/BalanceVal';
import { TokenBalanceItemType } from 'types/ui-types';
import { BN_ZERO } from 'utils/chainBalances';

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
const chainBalanceMetaWrapper: StyleProp<any> = {
  paddingLeft: 16,
};
const chainBalancePart2: StyleProp<any> = {
  alignItems: 'flex-end',
  paddingRight: 16,
  paddingLeft: 2,
};
const chainBalanceSeparator: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 72,
  marginRight: 16,
};

function getFormattedPrice(priceValue: number, isTestnet: boolean, isReady: boolean): string {
  if (!isTestnet && isReady && priceValue) {
    const priceArr = priceValue.toString().split('.');
    if (priceArr[1]) {
      priceArr[1] = priceArr[1].substring(0, 4);
    }

    return priceArr.join(',');
  }

  return '0';
}

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
  const reformatPrice = getFormattedPrice(priceValue, isTestnet, isReady);

  return (
    <TouchableOpacity style={{ width: '100%' }} {...wrapperProps}>
      <View style={chainBalanceMainArea}>
        <View style={chainBalancePart1}>
          {getNetworkLogo(logoKey, 40, networkKey)}
          <View style={chainBalanceMetaWrapper}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Text style={textStyle}>{displayedSymbol}</Text>
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

            <Text style={[subTextStyle, { color: ColorMap.primary }]}>{`$${reformatPrice}`}</Text>
          </View>
        </View>

        <View style={chainBalancePart2}>
          <BalanceVal
            balanceValTextStyle={textStyle}
            startWithSymbol
            symbol={''}
            value={!isReady ? BN_ZERO : balanceValue}
          />
          <BalanceVal
            balanceValTextStyle={subTextStyle}
            startWithSymbol
            symbol={'$'}
            value={isTestnet || !isReady ? BN_ZERO : convertedBalanceValue}
          />
        </View>
      </View>

      <View style={chainBalanceSeparator} />
    </TouchableOpacity>
  );
};
