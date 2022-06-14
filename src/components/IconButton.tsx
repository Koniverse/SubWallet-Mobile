import React, { useMemo } from 'react';
import {StyleSheet, TouchableOpacity, TouchableOpacityProps} from 'react-native';
import { IconProps } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props extends TouchableOpacityProps {
  icon: (iconProps: IconProps) => JSX.Element;
  color?: string;
  iconButtonStyle?: object;
}

export const IconButton = (iconButtonProps: Props) => {
  const { icon: Icon, color, iconButtonStyle } = iconButtonProps;
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        iconButtonWrapper: {
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [],
  );
  return (
    <TouchableOpacity
      {...iconButtonProps}
      style={[styles.iconButtonWrapper, iconButtonStyle]}
    >
      <Icon size={20} color={color || '#fff'} weight={'bold'} />
    </TouchableOpacity>
  );
};
