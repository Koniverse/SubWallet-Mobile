import React from 'react';

export interface ButtonPropsType {
  type?: 'primary' | 'secondary' | 'warning' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean | undefined;
  loading?: boolean;
  shape?: 'default' | 'square' | 'round' | 'circle' | 'squircle';
  block?: boolean;
  icon?: React.ReactNode | ((color: string) => React.ReactNode);
  contentAlign?: 'center' | 'left';
}
