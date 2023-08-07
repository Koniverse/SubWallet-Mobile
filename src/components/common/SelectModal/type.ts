import React from 'react';
import { IconProps } from 'phosphor-react-native';

export type ActionItemType = {
  key: string;
  backgroundColor: string;
  icon: React.ElementType<IconProps>;
  label: string;
  disabled?: boolean;
};

export type OptionType = {
  label: string;
  value: string;
};
