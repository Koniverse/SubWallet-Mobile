import React, { JSX } from 'react';
import { StyleProp, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { type Icon as PhosphorIcon } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';

interface Props extends TouchableOpacityProps {
  icon: PhosphorIcon;
  color?: string;
  size?: number;
}

const iconButtonWrapper: StyleProp<any> = {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

export const IconButton = (iconButtonProps: Props) => {
  const { icon: Icon, color, style, size = 20 } = iconButtonProps;

  return (
    <TouchableOpacity {...iconButtonProps} style={[iconButtonWrapper, style]}>
      <Icon size={size} color={color || ColorMap.light} weight={'bold'} />
    </TouchableOpacity>
  );
};
