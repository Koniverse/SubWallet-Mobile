import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableWithoutFeedback, TouchableWithoutFeedbackProps, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface ButtonProps extends TouchableWithoutFeedbackProps {
  title: string;
  color?: 'primary' | 'secondary';
}

export const Button = (buttonProps: ButtonProps) => {
  const theme = useSubWalletTheme().colors;
  const { title, color, style } = buttonProps;

  const ButtonStyle = useMemo(
    () =>
      StyleSheet.create({
        base: { opacity: 1, paddingLeft: 16, paddingRight: 16, paddingTop: 8, paddingBottom: 8, borderRadius: 6 },
        primary: {
          color: '#FFF',
          backgroundColor: theme.primary,
        },
        secondary: {
          color: '#FFF',
          backgroundColor: theme.secondary,
        },
      }),
    [theme],
  );
  const finalStyle = [style, ButtonStyle.base];

  const _color = color || 'secondary';
  if (ButtonStyle[_color]) {
    // @ts-ignore
    finalStyle.push(ButtonStyle[_color]);
  }

  return (
    <TouchableWithoutFeedback {...buttonProps}>
      <View style={finalStyle}>
        <Text style={{ color: 'inherit', textAlign: 'center' }}>{title}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};
