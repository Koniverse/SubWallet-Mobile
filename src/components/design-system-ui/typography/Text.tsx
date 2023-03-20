import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { TextSizeProps } from './PropsType';
import TypographyStyles from './style';

export interface TextProps {
  ellipsis?: boolean;
  monospace?: boolean;
  size?: TextSizeProps;
  style?: TextStyle;
  children?: React.ReactNode;
}

const Text: React.FC<TextProps> = ({ ellipsis, monospace, size, style, children, ...restProps }) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = TypographyStyles(theme);
  const allStyle = [monospace && _style?.monospace, size && _style[`${size}Text`], style];
  return (
    <RNText style={allStyle} numberOfLines={ellipsis ? 1 : undefined} {...restProps}>
      {children}
    </RNText>
  );
};

export default Text;
