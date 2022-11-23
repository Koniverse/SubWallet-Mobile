import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleProp } from 'react-native';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { IconProps } from 'phosphor-react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';

interface SecretTypeItemType extends TouchableOpacityProps {
  icon: (iconProps: IconProps) => JSX.Element;
  title: string;
  secretTypeItemStyle?: object;
  onClickButton: () => void;
}

const secretTypeItemContainer: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  width: '100%',
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const secretTypeItemText: StyleProp<any> = {
  color: ColorMap.light,
  ...sharedStyles.mediumText,
  ...FontMedium,
  paddingLeft: 16,
};

export const SecretTypeItem = (secretTypeItem: SecretTypeItemType) => {
  const { icon: Icon, title, secretTypeItemStyle, onClickButton } = secretTypeItem;
  return (
    <TouchableOpacity style={[secretTypeItemContainer, secretTypeItemStyle]} onPress={onClickButton}>
      <Icon size={20} color={ColorMap.disabled} weight={'bold'} />
      <Text style={secretTypeItemText}>{title}</Text>
    </TouchableOpacity>
  );
};
