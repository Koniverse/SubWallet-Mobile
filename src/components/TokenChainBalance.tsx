import React from 'react';
import { StyleProp, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { getNetworkLogo } from 'utils/index';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { BalanceVal } from 'components/BalanceVal';
import { BN_ZERO } from 'utils/chainBalances';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import BigN from 'bignumber.js';

interface Props extends TouchableOpacityProps {
  networkDisplayName: string;
  selectNetworkKey: string;
  tokenBalanceValue: BigN;
  convertedBalanceValue: BigN;
  tokenBalanceSymbol: string;
  defaultNetworkKey?: string;
}

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
};
const chainBalanceSeparator: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 72,
  marginRight: 16,
};

export const TokenChainBalance = ({
  networkDisplayName,
  selectNetworkKey,
  tokenBalanceSymbol,
  tokenBalanceValue,
  convertedBalanceValue,
  defaultNetworkKey,
  ...wrapperProps
}: Props) => {
  const {
    price: { tokenPriceMap },
  } = useSelector((state: RootState) => state);
  const reformatPrice = tokenPriceMap[tokenBalanceSymbol.toLowerCase()]
    ? tokenPriceMap[tokenBalanceSymbol.toLowerCase()].toString().replace('.', ',')
    : BN_ZERO;

  return (
    <TouchableOpacity style={{ width: '100%' }} {...wrapperProps}>
      <View style={chainBalanceMainArea}>
        <View style={chainBalancePart1}>
          {getNetworkLogo(selectNetworkKey.toLowerCase(), 40, defaultNetworkKey)}
          <View style={chainBalanceMetaWrapper}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Text style={textStyle}>{tokenBalanceSymbol}</Text>
              <Text style={textStyle}> (</Text>
              <Text style={[textStyle, { maxWidth: 130 }]} numberOfLines={1}>
                {networkDisplayName.replace(' Relay Chain', '')}
              </Text>
              <Text style={textStyle}>)</Text>
            </View>

            <Text style={[subTextStyle, { color: ColorMap.primary }]}>{`$${reformatPrice}`}</Text>
          </View>
        </View>

        <View style={chainBalancePart2}>
          <BalanceVal balanceValTextStyle={textStyle} symbol={tokenBalanceSymbol} value={tokenBalanceValue} />
          <BalanceVal balanceValTextStyle={subTextStyle} startWithSymbol symbol={'$'} value={convertedBalanceValue} />
        </View>
      </View>

      <View style={chainBalanceSeparator} />
    </TouchableOpacity>
  );
};
