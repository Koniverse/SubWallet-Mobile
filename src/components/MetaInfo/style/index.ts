import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontMedium } from 'styles/sharedStyles';

export default (theme: ThemeTypes) =>
  StyleSheet.create({
    'container.has-background-wrapper': {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      padding: theme.paddingSM,
    },
    'container.gap-xs': {
      gap: theme.sizeXS,
    },
    'container.gap-sm': {
      gap: theme.sizeSM,
    },
    'container.gap-ms': {
      gap: theme.size,
    },
    row: {
      overflow: 'hidden',
      flexDirection: 'row',
      gap: theme.sizeXS,
    },
    'row.d-column': {
      flexDirection: 'column',
    },
    col: {
      overflow: 'hidden',
      justifyContent: 'center',
    },
    'col.grow': {
      flex: 1,
    },
    'col.to-right': {
      alignItems: 'flex-end',
    },
    'col.v-align-top': {
      justifyContent: 'flex-start',
    },
    label: {
      ...FontMedium,
      fontSize: theme.fontSize,
      lineHeight: theme.lineHeight * theme.fontSize,
      textAlign: 'left',
    },
    value: {
      ...FontMedium,
      fontSize: theme.fontSize,
      lineHeight: theme.lineHeight * theme.fontSize,
      fontWeight: theme.bodyFontWeight,
    },
    valueWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      maxWidth: '100%',
      overflow: 'hidden',
    },
  });
