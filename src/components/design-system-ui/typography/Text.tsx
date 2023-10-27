import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React from 'react';
import { StyleProp, Text as RNText, TextStyle } from 'react-native';
import { TextSizeProps } from './PropsType';
import TypographyStyles from './style';
import { FontMedium } from 'styles/sharedStyles';

export interface TextProps {
  ellipsis?: boolean;
  numberOfLines?: number;
  monospace?: boolean;
  size?: TextSizeProps;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  onPress?: () => void;
}

const Text: React.FC<TextProps> = ({
  ellipsis,
  monospace,
  size = 'default',
  style,
  children,
  numberOfLines = 1,
  ...restProps
}) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = TypographyStyles(theme);
  const allStyle = [FontMedium, monospace && _style?.monospace, size && _style[`${size}Text`], style];
  return (
    <RNText style={allStyle} numberOfLines={ellipsis ? numberOfLines : undefined} {...restProps}>
      {children}
    </RNText>
  );
};

export default Text;
