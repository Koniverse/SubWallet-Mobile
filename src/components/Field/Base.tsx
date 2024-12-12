import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Typography } from 'components/design-system-ui';

export interface FieldBaseProps extends ViewProps {
  label?: string;
  outerStyle?: StyleProp<ViewStyle>;
  fieldBgc?: string;
}

export const FieldBase = ({ children, label, outerStyle, ...props }: FieldBaseProps) => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyle(theme), [theme]);

  return (
    <View style={[styles.container, outerStyle]} {...props}>
      {!!label && <Typography.Text style={styles.label}>{label}</Typography.Text>}
      {children}
    </View>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      borderRadius: theme.borderRadiusLG,
      marginBottom: theme.sizeXS,
      backgroundColor: theme.colorBgSecondary,
    },
    label: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
      lineHeight: theme.lineHeightSM * theme.fontSizeSM,
      color: theme.colorTextLight4,
      paddingHorizontal: theme.sizeSM,
      paddingTop: theme.sizeXS,
      marginBottom: -4,
    },
  });
}
