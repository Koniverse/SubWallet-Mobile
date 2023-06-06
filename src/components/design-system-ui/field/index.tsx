import React from 'react';
import { View, ViewStyle } from 'react-native';
import createStylesheet from './style';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Typography } from 'components/design-system-ui';
import { StyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { TextStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

interface Props {
  label?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const Field = ({ label, labelStyle, style, children }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);

  return (
    <View style={[stylesheet.container, style]}>
      {!!label && <Typography.Text style={[stylesheet.inputLabel, labelStyle]}>{label}</Typography.Text>}
      {children}
    </View>
  );
};

export default Field;
