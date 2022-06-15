import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedbackProps, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import {FontSemiBold, sharedStyles} from "styles/sharedStyles";

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
        base: { opacity: 1, paddingLeft: 16, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 5 },
        primary: {
          color: '#FFF',
          backgroundColor: theme.primary,
        },
        secondary: {
          color: '#FFF',
          backgroundColor: theme.secondary,
        },
        buttonTextStyle: {
          color: theme.textColor,
          textAlign: 'center',
          ...sharedStyles.mediumText,
          ...FontSemiBold,
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
    <TouchableOpacity {...buttonProps}>
      <View style={finalStyle}>
        <Text style={ButtonStyle.buttonTextStyle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};
