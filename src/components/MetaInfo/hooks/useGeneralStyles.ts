import { useContext, useMemo } from 'react';
import { MetaInfoContext } from '../context';
import { ThemeTypes } from 'styles/themes';
import { StyleSheet } from 'react-native';
import { FontMedium, FontSemiBold } from 'styles/sharedStyles';
import { getSchemaColor } from '../shared';

export default function useGeneralStyles(theme: ThemeTypes) {
  const {
    labelColorScheme = 'light',
    labelFontWeight = 'semibold',
    valueColorScheme = 'gray',
  } = useContext(MetaInfoContext);
  return useMemo(() => {
    return StyleSheet.create({
      labelGeneralStyle: {
        color: getSchemaColor(labelColorScheme, theme),
        ...(labelFontWeight === 'semibold' ? FontSemiBold : FontMedium),
      },
      valueGeneralStyle: {
        color: getSchemaColor(valueColorScheme, theme),
      },
    });
  }, [labelColorScheme, labelFontWeight, theme, valueColorScheme]);
}
