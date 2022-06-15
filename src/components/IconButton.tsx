import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { IconProps } from 'phosphor-react-native';

interface Props extends TouchableOpacityProps {
  icon: (iconProps: IconProps) => JSX.Element;
  color?: string;
  iconButtonStyle?: object;
}

const iconButtonWrapper: StyleProp<any> = {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

export const IconButton = (iconButtonProps: Props) => {
  const { icon: Icon, color, iconButtonStyle } = iconButtonProps;

  return (
    <TouchableOpacity {...iconButtonProps} style={[iconButtonWrapper, iconButtonStyle]}>
      <Icon size={20} color={color || '#fff'} weight={'bold'} />
    </TouchableOpacity>
  );
};
