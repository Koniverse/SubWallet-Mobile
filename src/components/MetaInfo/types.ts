import React from 'react';
import { TextStyle } from 'react-native';

export type SchemeColor = 'light' | 'gray' | 'success' | 'gold' | 'danger' | 'warning';

export interface InfoItemBase {
  label?: string | ((labelStyle: TextStyle) => React.ReactNode);
  valueColorSchema?: SchemeColor;
  loading?: boolean;
}

export interface InfoItemGeneralProps {
  labelColorScheme?: SchemeColor;
  labelFontWeight?: 'regular' | 'semibold';
  valueColorScheme?: SchemeColor;
}
