import React from 'react';
export type SchemeColor = 'light' | 'gray' | 'success' | 'gold' | 'danger' | 'warning' | 'primary';

export interface InfoItemBase {
  label?: string | React.ReactNode;
  valueColorSchema?: SchemeColor;
  loading?: boolean;
}

export interface InfoItemGeneralProps {
  labelColorScheme?: SchemeColor;
  labelFontWeight?: 'regular' | 'semibold';
  valueColorScheme?: SchemeColor;
}
