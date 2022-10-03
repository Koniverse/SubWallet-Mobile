import { ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import BigN from 'bignumber.js';
import { BalanceVal } from 'components/BalanceVal';
import ValidatorName from 'components/Staking/ValidatorName';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import React from 'react';
import { Image, ImageStyle, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { CaretRight } from 'phosphor-react-native';

interface Props {
  validator: ValidatorInfo;
  rightIcon?: boolean;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  borderRadius: 5,
  backgroundColor: ColorMap.dark2,
  paddingHorizontal: 16,
  paddingVertical: 14,
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  marginBottom: 8,
};

const LeftPartStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  flexShrink: 1,
  position: 'relative',
  overflow: 'hidden',
};

const AvatarContainerStyle: StyleProp<ViewStyle> = {
  width: 20,
  height: 20,
  borderRadius: 20,
  borderColor: ColorMap.secondary,
  padding: 2,
  borderWidth: 2,
  backgroundColor: ColorMap.dark,
};

const AvatarImageStyle: StyleProp<ImageStyle> = {
  width: 12,
  height: 12,
  borderRadius: 12,
};

const ValidatorNameContainerStyle: StyleProp<ViewStyle> = {
  marginLeft: 16,
  overflow: 'hidden',
};

const ValidatorNameTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  width: '80%',
};

const RightPartStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexGrow: 1,
  flexShrink: 0,
  marginLeft: 8,
};

const ReturnContainerStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

const ReturnTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.primary,
};

const RightIconStyle: StyleProp<ViewStyle> = {
  marginLeft: 8,
};

const ValidatorBriefInfo = ({ validator, rightIcon = false }: Props) => {
  const { icon, address, expectedReturn } = validator;

  return (
    <View style={WrapperStyle}>
      <View style={LeftPartStyle}>
        {icon ? (
          <View style={AvatarContainerStyle}>
            <Image source={{ uri: icon }} style={AvatarImageStyle} />
          </View>
        ) : (
          <View>
            <SubWalletAvatar size={20} address={address} />
          </View>
        )}
        <View style={ValidatorNameContainerStyle}>
          <ValidatorName validatorInfo={validator} textStyle={ValidatorNameTextStyle} />
        </View>
      </View>
      <View style={RightPartStyle}>
        <View style={ReturnContainerStyle}>
          <Text style={ReturnTextStyle}>(</Text>
          <BalanceVal
            balanceValTextStyle={ReturnTextStyle}
            symbol={'%'}
            withComma={true}
            value={new BigN(expectedReturn)}
          />
          <Text style={ReturnTextStyle}>)</Text>
        </View>
        {rightIcon && <CaretRight size={20} style={RightIconStyle} color={ColorMap.disabled} />}
      </View>
    </View>
  );
};

export default React.memo(ValidatorBriefInfo);
