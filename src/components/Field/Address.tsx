import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import React from 'react';
import reformatAddress, { toShort } from 'utils/index';
import { StyleProp, Text, View } from 'react-native';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import { Info } from 'phosphor-react-native';
import { IconButton } from 'components/IconButton';

interface Props extends FieldBaseProps {
  address: string;
  networkPrefix?: number;
}

const addressStyle: StyleProp<any> = {
  ...FontSize2,
  ...FontMedium,
  lineHeight: 25,
  color: ColorMap.disabled,
};

const blockContentStyle: StyleProp<any> = {
  position: 'relative',
  flexDirection: 'row',
  paddingLeft: 16,
  alignItems: 'center',
  paddingBottom: 10,
};

const avatarStyle: StyleProp<any> = {
  border: 0,
  marginRight: 6,
};

const infoIconStyle: StyleProp<any> = {
  position: 'absolute',
  right: 6,
  bottom: 3,
};

// todo: onPress infoIcon
export const AddressField = ({ address, networkPrefix, ...fieldBase }: Props) => {
  const formattedAddress = networkPrefix ? reformatAddress(address, networkPrefix || -1) : address;

  return (
    <FieldBase {...fieldBase}>
      <View style={blockContentStyle}>
        <SubWalletAvatar address={address} size={18} style={avatarStyle} />
        <Text style={addressStyle}>{toShort(formattedAddress, 10, 10)}</Text>
        <IconButton color={ColorMap.disabled} style={infoIconStyle} icon={Info} onPress={() => {}} />
      </View>
    </FieldBase>
  );
};
