import { ValidatorInfo } from '@subwallet/extension-base/background/KoniTypes';
import { CircleWavyCheck, Trophy } from 'phosphor-react-native';
import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';

interface Props {
  validatorInfo: ValidatorInfo;
  onlyVerifiedIcon?: boolean;
  isBonding?: boolean;
  textStyle: StyleProp<TextStyle>;
  iconSize?: number;
  iconColor?: string;
}

const WrapperStyle: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
};

const ValidatorNameContainerStyle: StyleProp<ViewStyle> = {
  maxWidth: '100%',
  flexShrink: 1,
};

const ValidatorIconContainerStyle: StyleProp<ViewStyle> = {
  flexGrow: 1,
  flexShrink: 0,
};

const IconStyle: StyleProp<ViewStyle> = {
  marginLeft: 8,
};

const ValidatorName = ({
  validatorInfo,
  onlyVerifiedIcon = false,
  iconSize = 16,
  textStyle,
  iconColor = ColorMap.primary,
  isBonding = false,
}: Props) => {
  const { identity, address, isVerified } = validatorInfo;

  return (
    <View style={WrapperStyle}>
      <View style={ValidatorNameContainerStyle}>
        <Text style={textStyle} numberOfLines={1} ellipsizeMode={'middle'}>
          {identity ? identity : address}
        </Text>
      </View>
      <View style={ValidatorIconContainerStyle}>
        {isVerified && <CircleWavyCheck size={iconSize} color={iconColor} style={IconStyle} />}
        {!onlyVerifiedIcon && isBonding && <Trophy size={iconSize} color={iconColor} style={IconStyle} />}
      </View>
    </View>
  );
};

export default React.memo(ValidatorName);
