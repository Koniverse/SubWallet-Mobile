import React from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { IconProps } from 'phosphor-react-native';

interface Props extends TouchableOpacityProps {
  icon: (iconProps: IconProps) => JSX.Element;
  color?: string;
}

const iconButtonWrapper: StyleProp<any> = {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

export const IconButton = (iconButtonProps: Props) => {
  const { icon: Icon, color, style } = iconButtonProps;

  return (
    <TouchableOpacity {...iconButtonProps} style={[iconButtonWrapper, style]}>
      <Icon size={20} color={color || '#fff'} weight={'bold'} />
    </TouchableOpacity>
  );
};
