import BigN from 'bignumber.js';
import { StakingDataType } from 'hooks/types';
import React, { useMemo } from 'react';
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo } from 'utils/index';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { BalanceVal } from 'components/BalanceVal';
import { getConvertedBalance } from 'utils/chainBalances';

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
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

const NetworkNameStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
};

const NetworkSubTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const BalanceInfoContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  paddingLeft: 2,
  flex: 2,
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

const SeparatorStyle: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 56,
};

const StakingBalanceItem = ({ stakingData, priceMap, onPress }: Props) => {
  const { staking } = stakingData;

  const networkKey = staking.chainId;

  const networkDisplayName = useMemo((): string => {
    return staking.name.replace(' Relay Chain', '');
  }, [staking.name]);

  const balanceValue = useMemo((): BigN => {
    return new BigN(staking.balance || 0);
  }, [staking.balance]);

  const symbol = staking.nativeToken;

  const convertedBalanceValue = useMemo(() => {
    return getConvertedBalance(new BigN(staking.balance || 0), `${priceMap[staking.chainId] || 0}`);
  }, [priceMap, staking.balance, staking.chainId]);

  return (
    <TouchableOpacity style={WrapperStyle} activeOpacity={0.5} onPress={onPress(stakingData)}>
      <View style={InfoContainerStyle}>
        <View style={NetworkInfoWrapperStyle}>
          {getNetworkLogo(networkKey, 40)}
          <View style={NetworkInfoContentStyle}>
            <Text style={NetworkNameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
              {networkDisplayName}
            </Text>
            <Text style={NetworkSubTextStyle}>{i18n.stakingScreen.balanceList.stakingBalance}</Text>
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
