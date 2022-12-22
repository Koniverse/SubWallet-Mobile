import { ChainBondingBasics, NetworkJson } from '@subwallet/extension-base/background/KoniTypes';
import React, { useMemo } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, FontSize0, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo, getRoundedDecimalNumber } from 'utils/index';
import useGetValidatorType from 'hooks/screen/Staking/useGetValidatorType';

interface Props {
  network: NetworkJson;
  bondingMeta?: ChainBondingBasics;
  onPress: (value: NetworkJson) => () => void;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  width: '100%',
  paddingHorizontal: 16,
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
  flex: 1,
};

const NetworkInfoContentStyle: StyleProp<ViewStyle> = {
  paddingLeft: 16,
  paddingRight: 8,
  display: 'flex',
  flexDirection: 'column',
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

const formatStakedReturn = (stakedReturn?: number) => {
  if (stakedReturn) {
    const stakedReturnArr = stakedReturn.toString().split('e');
    if (stakedReturnArr.length === 2) {
      return `~${getRoundedDecimalNumber(stakedReturnArr[0])}e${stakedReturnArr[1]} %`;
    } else {
      return `${getRoundedDecimalNumber(stakedReturnArr[0])} %`;
    }
  } else {
    return `${getRoundedDecimalNumber('0')}.00 %`;
  }
};

const StakingNetworkItem = ({ network, bondingMeta, onPress }: Props) => {
  const { key: networkKey, chain: networkName } = network;
  const validatorType = useGetValidatorType(networkKey);
  const stakedReturn = bondingMeta?.stakedReturn;
  const validatorCount = bondingMeta?.validatorCount;

  const validatorTitle = useMemo((): string => {
    switch (validatorType) {
      case 'Collator':
        return i18n.common.collator.toLowerCase();
      case 'DApp':
        return i18n.common.dApp;
      case 'Validator':
      case 'Unknown':
      default:
        return i18n.common.validator.toLowerCase();
    }
  }, [validatorType]);

  return (
    <TouchableOpacity style={WrapperStyle} activeOpacity={0.5} onPress={onPress(network)}>
      <View style={InfoContainerStyle}>
        <View style={NetworkInfoWrapperStyle}>
          {getNetworkLogo(networkKey, 40)}
          <View style={NetworkInfoContentStyle}>
            <Text style={NetworkNameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
              {networkName.replace(' Relay Chain', '')}
            </Text>
            <Text style={ValidatorTextStyle}>
              {Math.ceil(validatorCount || 0)}&nbsp;{validatorTitle}
            </Text>
          </View>
        </View>

        <View style={BalanceInfoContainerStyle}>
          {!!stakedReturn && <Text style={ReturnedTextStyle}>{formatStakedReturn(stakedReturn)}</Text>}
        </View>
      </View>

      <View style={SeparatorStyle} />
    </TouchableOpacity>
  );
};

export default React.memo(StakingNetworkItem);
