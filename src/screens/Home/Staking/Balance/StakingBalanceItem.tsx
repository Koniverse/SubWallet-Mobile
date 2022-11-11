import { StakingType } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { StakingDataType } from 'hooks/types';
import { User, Users } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { getConvertedBalance } from 'utils/chainBalances';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo } from 'utils/index';

interface Props {
  stakingData: StakingDataType;
  priceMap: Record<string, number>;
  onPress: (value: StakingDataType) => () => void;
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
  flex: 5,
};

const NetworkInfoContentStyle: StyleProp<ViewStyle> = {
  paddingLeft: 16,
  paddingRight: 8,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
};

const NetworkNameStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const BaseBannerStyle: StyleProp<ViewStyle> = {
  paddingHorizontal: 4,
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  alignSelf: 'flex-start',
};

const NominatedBannerStyle: StyleProp<ViewStyle> = {
  backgroundColor: ColorMap.nominatedBackground,
};

const PoolBannerStyle: StyleProp<ViewStyle> = {
  backgroundColor: ColorMap.pooledBackground,
};

const IconStyle: StyleProp<ViewStyle> = {
  marginRight: 4,
};

const BaseNetworkSubTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  ...FontSize0,
};

const PoolNetworkSubTextStyle: StyleProp<TextStyle> = {
  color: ColorMap.primary,
};

const NominatedNetworkSubTextStyle: StyleProp<TextStyle> = {
  color: ColorMap.disabled,
};

const BalanceInfoContainerStyle: StyleProp<ViewStyle> = {
  alignItems: 'flex-end',
  paddingLeft: 2,
};

const BalanceTokenTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontMedium,
  color: ColorMap.light,
};

const BalancePriceTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
};

const BalanceSymbolTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const SeparatorStyle: StyleProp<ViewStyle> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 56,
};

const StakingBalanceItem = ({ stakingData, priceMap, onPress }: Props) => {
  const { staking } = stakingData;

  const networkDisplayName = useMemo((): string => {
    return staking.name.replace(' Relay Chain', '');
  }, [staking.name]);

  const balanceValue = useMemo((): BigN => {
    return new BigN(staking.balance || 0);
  }, [staking.balance]);

  const symbol = staking.nativeToken;

  const convertedBalanceValue = useMemo(() => {
    return getConvertedBalance(new BigN(staking.balance || 0), `${priceMap[staking.chain] || 0}`);
  }, [priceMap, staking.balance, staking.chain]);

  return (
    <TouchableOpacity style={WrapperStyle} activeOpacity={0.5} onPress={onPress(stakingData)}>
      <View style={InfoContainerStyle}>
        <View style={NetworkInfoWrapperStyle}>
          {getNetworkLogo(staking.chain, 40)}
          <View style={NetworkInfoContentStyle}>
            <Text style={NetworkNameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
              {networkDisplayName}
            </Text>
            <View
              style={[
                BaseBannerStyle,
                staking.type === StakingType.NOMINATED ? NominatedBannerStyle : PoolBannerStyle,
              ]}>
              {staking.type === StakingType.NOMINATED ? (
                <User size={12} color={ColorMap.disabled} style={IconStyle} />
              ) : (
                <Users size={12} color={ColorMap.primary} style={IconStyle} />
              )}
              <Text
                style={[
                  BaseNetworkSubTextStyle,
                  staking.type === StakingType.NOMINATED ? NominatedNetworkSubTextStyle : PoolNetworkSubTextStyle,
                ]}>
                {i18n.stakingScreen.balanceList.nominatedBalance}
              </Text>
            </View>
          </View>
        </View>

        <View style={BalanceInfoContainerStyle}>
          <BalanceVal
            balanceValTextStyle={BalanceTokenTextStyle}
            symbolTextStyle={BalanceSymbolTextStyle}
            symbol={symbol}
            withSymbol={true}
            value={balanceValue}
          />
          <BalanceVal
            balanceValTextStyle={BalancePriceTextStyle}
            symbolTextStyle={[BalanceSymbolTextStyle]}
            startSymbolTextStyle={{ marginRight: 4 }}
            startWithSymbol
            symbol={'$'}
            value={convertedBalanceValue}
          />
        </View>
      </View>

      <View style={SeparatorStyle} />
    </TouchableOpacity>
  );
};

export default React.memo(StakingBalanceItem);
