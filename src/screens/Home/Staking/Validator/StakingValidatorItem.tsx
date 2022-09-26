import { formatBalance } from '@polkadot/util';
import { NetworkJson, ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { CircleWavyCheck, Users } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { Image, ImageStyle, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { NetworkValidatorsInfo } from 'types/staking';
import { getBalanceWithSi, toShort } from 'utils/index';

interface Props {
  data: ValidatorInfo;
  onPress: (val: ValidatorInfo) => () => void;
  network: NetworkJson;
  networkValidatorsInfo: NetworkValidatorsInfo;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  width: '100%',
};

const InfoContainerStyle: StyleProp<ViewStyle> = {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '100%',
  paddingTop: 16,
  paddingBottom: 16,
};
const InfoContentWrapperStyle: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  overflow: 'hidden',
  flex: 9,
};

const ValidatorInfoContentStyle: StyleProp<ViewStyle> = {
  paddingLeft: 12,
  paddingRight: 8,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

const RowCenterContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

const ValidatorNameStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.light,
};

const TitleStakeInfoTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  ...FontSize0,
  color: ColorMap.disabled,
  marginRight: 4,
};

const ValueStakeInfoTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  ...FontSize0,
  color: ColorMap.light,
};

const VerifiedIconStyle: StyleProp<ViewStyle> = {
  marginLeft: 8,
};

const NominatorInfoContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  paddingLeft: 2,
  flex: 2,
};

const CommissionTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.primary,
};

const NominatorCountTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  ...FontSize0,
  marginRight: 4,
};

const SeparatorStyle: StyleProp<any> = {
  borderBottomWidth: 1,
  borderBottomColor: ColorMap.dark2,
  marginLeft: 36,
};

const AvatarContainerStyle: StyleProp<ViewStyle> = {
  width: 24,
  height: 24,
  borderRadius: 24,
  borderColor: ColorMap.secondary,
  padding: 2,
  borderWidth: 2,
  backgroundColor: ColorMap.dark,
};

const AvatarImageStyle: StyleProp<ImageStyle> = {
  width: 16,
  height: 16,
  borderRadius: 16,
};

const StakingValidatorItem = ({ onPress, data, network, networkValidatorsInfo }: Props) => {
  const { icon, totalStake, commission, identity, nominatorCount, minBond, isVerified, address } = data;
  const tokenSymbol = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);

  const [totalStakeValue, totalStakeToken] = getBalanceWithSi(
    totalStake.toString(),
    0,
    formatBalance.findSi('-'),
    tokenSymbol,
  );

  const isMax = useMemo(() => {
    return networkValidatorsInfo.maxNominatorPerValidator <= nominatorCount;
  }, [networkValidatorsInfo.maxNominatorPerValidator, nominatorCount]);

  return (
    <TouchableOpacity style={WrapperStyle} onPress={onPress(data)}>
      <View style={InfoContainerStyle}>
        <View style={InfoContentWrapperStyle}>
          {icon ? (
            <View style={AvatarContainerStyle}>
              <Image source={{ uri: icon }} style={AvatarImageStyle} />
            </View>
          ) : (
            <View>
              <SubWalletAvatar size={16} address={address} />
            </View>
          )}
          <View style={ValidatorInfoContentStyle}>
            <View style={RowCenterContainerStyle}>
              <Text style={ValidatorNameStyle} numberOfLines={1} ellipsizeMode={'tail'}>
                {identity ? identity : toShort(address)}
              </Text>
              {isVerified && <CircleWavyCheck size={16} color={ColorMap.primary} style={VerifiedIconStyle} />}
            </View>
            <View style={RowCenterContainerStyle}>
              <Text style={TitleStakeInfoTextStyle}>{'Total Stake '}</Text>
              <BalanceVal
                balanceValTextStyle={ValueStakeInfoTextStyle}
                value={new BigN(totalStakeValue)}
                symbol={totalStakeToken}
                withSymbol={true}
              />
            </View>
            <View style={RowCenterContainerStyle}>
              <Text style={TitleStakeInfoTextStyle}>{'Min Stake '}</Text>
              <BalanceVal
                balanceValTextStyle={ValueStakeInfoTextStyle}
                value={new BigN(minBond)}
                symbol={tokenSymbol}
                withSymbol={true}
              />
            </View>
          </View>
        </View>

        <View style={NominatorInfoContainerStyle}>
          <BalanceVal
            balanceValTextStyle={CommissionTextStyle}
            symbol={'%'}
            withSymbol={true}
            value={new BigN(commission)}
          />
          <View style={RowCenterContainerStyle}>
            <Text style={[NominatorCountTextStyle, { color: isMax ? ColorMap.danger : ColorMap.light }]}>
              {nominatorCount}
            </Text>
            <Users size={16} color={isMax ? ColorMap.danger : ColorMap.light} />
          </View>
        </View>
      </View>
      <View style={SeparatorStyle} />
    </TouchableOpacity>
  );
};

export default React.memo(StakingValidatorItem);
