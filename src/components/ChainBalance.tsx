import React from 'react';
import {StyleProp, Text, TouchableOpacity, View} from 'react-native';
import { getNetworkLogo, toShort } from 'utils/index';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import Loading from 'components/Loading';
import { ColorMap } from 'styles/color';
import { AccountInfoByNetwork } from 'types/ui-types';

interface Props {
  isLoading: boolean;
  accountInfo: AccountInfoByNetwork;
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

export const ChainBalance = ({ accountInfo, isLoading }: Props) => {
  return (
    <TouchableOpacity style={{ width: '100%' }}>
      <View style={chainBalanceMainArea}>
        <View style={chainBalancePart1}>
          {getNetworkLogo(accountInfo.networkLogo, 40)}
          <View style={chainBalanceMetaWrapper}>
            <Text style={textStyle}>{accountInfo.networkDisplayName}</Text>
            <Text style={subTextStyle}>{toShort(accountInfo.formattedAddress)}</Text>
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
    </TouchableOpacity>
  );
};
