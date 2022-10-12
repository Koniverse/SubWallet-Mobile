import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import React from 'react';
import { Image, ImageStyle, StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { CaretDown } from 'phosphor-react-native';
import { toShort } from 'utils/index';

interface Props {
  validator: DelegationItem;
  onPress: () => void;
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
  backgroundColor: ColorMap.dark,
};

const AvatarImageStyle: StyleProp<ImageStyle> = {
  width: 20,
  height: 20,
  borderRadius: 20,
};

const ValidatorNameContainerStyle: StyleProp<ViewStyle> = {
  marginLeft: 16,
  width: '80%',
  paddingRight: 16,
};

const ValidatorNameTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
  color: ColorMap.light,
  width: '100%',
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

const RightIconStyle: StyleProp<ViewStyle> = {
  paddingLeft: 8,
};

const DelegationBriefInfo = ({ validator, onPress }: Props) => {
  const { identity, owner } = validator;
  // @ts-ignore
  const icon = validator.icon;

  return (
    <TouchableOpacity style={WrapperStyle} onPress={onPress}>
      <View style={LeftPartStyle}>
        {icon ? (
          <View style={AvatarContainerStyle}>
            <Image source={{ uri: icon }} style={AvatarImageStyle} />
          </View>
        ) : (
          <View>
            <SubWalletAvatar size={20} address={owner} />
          </View>
        )}
        <View style={ValidatorNameContainerStyle}>
          <Text style={ValidatorNameTextStyle}>{identity ? identity : toShort(owner)}</Text>
        </View>
      </View>
      <View style={RightPartStyle}>
        {/*<View style={ReturnContainerStyle}>*/}
        {/*  <Text style={ReturnTextStyle}>(</Text>*/}
        {/*  <BalanceVal*/}
        {/*    balanceValTextStyle={ReturnTextStyle}*/}
        {/*    symbol={'%'}*/}
        {/*    withComma={true}*/}
        {/*    value={new BigN(expectedReturn)}*/}
        {/*  />*/}
        {/*  <Text style={ReturnTextStyle}>)</Text>*/}
        {/*</View>*/}
        <CaretDown size={20} style={RightIconStyle} color={ColorMap.disabled} weight={'bold'} />
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(DelegationBriefInfo);
