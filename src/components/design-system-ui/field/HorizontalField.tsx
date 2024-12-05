import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Typography } from 'components/design-system-ui';
import { TextStyle } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

export interface FieldBaseProps extends ViewProps {
  label?: string;
  outerStyle?: StyleProp<ViewStyle>;
  fieldBgc?: string;
  labelStyle?: StyleProp<TextStyle>;
}

export const FieldHorizontal = ({ children, label, outerStyle, labelStyle, ...props }: FieldBaseProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <View style={[styles.container, outerStyle]} {...props}>
      {!!label && <Typography.Text style={[styles.label, labelStyle]}>{label}</Typography.Text>}
      {children}
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      borderRadius: theme.borderRadiusLG,
      backgroundColor: theme.colorBgSecondary,
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
      lineHeight: theme.lineHeightSM * theme.fontSizeSM,
      color: theme.colorTextLight4,
      paddingLeft: theme.sizeSM,
    },
  });
}
