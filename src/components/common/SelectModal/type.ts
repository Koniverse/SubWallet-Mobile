import React from 'react';
import { IconProps } from 'phosphor-react-native';

export type ActionItemType = {
  key: string;
  backgroundColor: string;
  icon?: React.ElementType<IconProps>;
  // Rendered in place of `icon` when the item needs an image instead of a phosphor icon.
  leftItemIcon?: React.ReactNode;
  label: string;
  disabled?: boolean;
};

export type OptionType = {
  label: string;
  value: string;
};
