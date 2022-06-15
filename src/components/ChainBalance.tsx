import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { getNetworkLogo, toShort } from 'utils/index';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import Loading from 'components/Loading';
import { ColorMap } from 'styles/color';

interface Props {
  isLoading: boolean;
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
};
const textStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
};
const subTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
};
const chainBalanceMetaWrapper: StyleProp<any> = {
  paddingLeft: 16,
};
const chainBalancePart2: StyleProp<any> = {
  alignItems: 'flex-end',
};
const chainBalanceSeparator: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 56,
};

export const ChainBalance = ({ isLoading }: Props) => {
  return (
    <View style={{ width: '100%' }}>
      <View style={chainBalanceMainArea}>
        <View style={chainBalancePart1}>
          {getNetworkLogo('polkadot', 40)}
          <View style={chainBalanceMetaWrapper}>
            <Text style={textStyle}>Polkadot Relay Chain</Text>
            <Text style={subTextStyle}>{toShort('12indbLeXK6wt77TvzHbnm13NEk79fozg5rE8JyREHgwGr79')}</Text>
          </View>
        </View>

        {isLoading && (
          <View style={chainBalancePart2}>
            <Loading width={40} height={40} />
          </View>
        )}

        {!isLoading && (
          <View style={chainBalancePart2}>
            <Text style={textStyle}>1200 DOT</Text>
            <Text style={subTextStyle}>$1,800</Text>
          </View>
        )}
      </View>

      <View style={chainBalanceSeparator} />
    </View>
  );
};
