import { ChainBondingBasics, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import React from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, FontSize0, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo } from 'utils/index';

interface Props {
  network: NetworkJson;
  bondingMeta?: ChainBondingBasics;
  onPress: (value: NetworkJson) => () => void;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  width: '100%',
};

const InfoContainerStyle: StyleProp<ViewStyle> = {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  paddingTop: 20,
  paddingBottom: 12,
};
const NetworkInfoWrapperStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'center',
  overflow: 'hidden',
  flex: 5,
};

const NetworkInfoContentStyle: StyleProp<ViewStyle> = {
  paddingLeft: 16,
  paddingRight: 8,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

const NetworkNameStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const ValidatorTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  ...FontSize0,
  color: ColorMap.disabled,
};

const BalanceInfoContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'center',
  paddingLeft: 2,
  flex: 2,
};

const ReturnedTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.primary,
};

const SeparatorStyle: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 56,
};

const StakingNetworkItem = ({ network, bondingMeta, onPress }: Props) => {
  const { key: networkKey, chain: networkName } = network;
  const stakedReturn = bondingMeta?.stakedReturn;

  return (
    <TouchableOpacity style={WrapperStyle} activeOpacity={0.5} onPress={onPress(network)}>
      <View style={InfoContainerStyle}>
        <View style={NetworkInfoWrapperStyle}>
          {getNetworkLogo(networkKey, 40)}
          <View style={NetworkInfoContentStyle}>
            <Text style={NetworkNameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
              {networkName}
            </Text>
            <Text style={ValidatorTextStyle}>
              {Math.ceil(stakedReturn || 0)}&nbsp;{i18n.stakingScreen.networkList.validators}
            </Text>
          </View>
        </View>

        <View style={BalanceInfoContainerStyle}>
          <BalanceVal
            balanceValTextStyle={ReturnedTextStyle}
            symbol={'%'}
            withSymbol={true}
            value={new BigN(stakedReturn || 0)}
          />
        </View>
      </View>

      <View style={SeparatorStyle} />
    </TouchableOpacity>
  );
};

export default React.memo(StakingNetworkItem);
