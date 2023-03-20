import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React from 'react';
import { StyleProp, Text as RNText, TextStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { TextSizeProps } from './PropsType';
import TypographyStyles from './style';

export interface LinkProps {
  icon?: React.ReactElement;
  onPress: () => void;
  size?: TextSizeProps;
  style?: StyleProp<TextStyle>;
  underline?: boolean;
  children?: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ icon, onPress, size, style, underline = true, children, ...restProps }) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = TypographyStyles(theme);
  const allStyle = [underline && _style?.underline, size && _style[`${size}Text`], style];
  return (
    <TouchableOpacity onPress={onPress} style={_style.linkWrapper}>
      {icon}
      <RNText style={allStyle} {...restProps}>
        {children}
      </RNText>
    </TouchableOpacity>
  );
};

export default Link;
