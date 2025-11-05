import React from 'react';
export type SchemeColor =
  | 'light'
  | 'gray'
  | 'success'
  | 'gold'
  | 'danger'
  | 'warning'
  | 'primary'
  | 'orange-7'
  | 'lime-7'
  | 'cyan-7';

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
