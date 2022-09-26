import { formatBalance } from '@polkadot/util';
import { NetworkJson, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { CircleWavyCheck, Users } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { Image, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { getBalanceWithSi, toShort } from 'utils/index';

interface Props {
  data: ValidatorInfo;
  onPress: (val: ValidatorInfo) => () => void;
  network: NetworkJson;
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

const StakingValidatorItem = ({ onPress, data, network }: Props) => {
  const {
    icon,
    totalStake,
    commission,
    identity,
    nominatorCount,
    minBond,
    isVerified,
    address,
  } = data;
  const tokenSymbol = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const [totalStakeValue, totalStakeToken] = getBalanceWithSi(
    totalStake.toString(),
    0,
    formatBalance.findSi('-'),
    tokenSymbol,
  );

  return (
    <TouchableOpacity style={WrapperStyle} onPress={onPress(data)}>
      <View style={InfoContainerStyle}>
        <View style={NetworkInfoWrapperStyle}>
          {icon && (
            <View>
              <Image source={{}} />
            </View>
          )}
          {!icon && <SubWalletAvatar size={40} address={address} />}
          <View style={NetworkInfoContentStyle}>
            <View>
              <Text style={NetworkNameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
                {identity ? identity : toShort(address)}
              </Text>
              { isVerified && <CircleWavyCheck size={40} /> }
            </View>
            <View>
              <Text style={ValidatorTextStyle}>{'Total Stake '}</Text>
              <BalanceVal value={new BigN(totalStakeValue)} symbol={totalStakeToken} withSymbol={true} />
            </View>
            <View>
              <Text style={ValidatorTextStyle}>{'Min Stake '}</Text>
              <BalanceVal value={new BigN(minBond)} symbol={tokenSymbol} withSymbol={true} />
            </View>
          </View>
        </View>

        <View style={BalanceInfoContainerStyle}>
          <BalanceVal
            // balanceValTextStyle={BalanceTokenTextStyle}
            // symbolTextStyle={BalanceSymbolTextStyle}
            symbol={'%'}
            withSymbol={true}
            value={new BigN(commission)}
          />
          <View>
            <Text>{nominatorCount}</Text>
            <Users size={40} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(StakingValidatorItem);
