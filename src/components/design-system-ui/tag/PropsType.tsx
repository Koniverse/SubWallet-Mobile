import React from 'react';
import { LiteralUnion, PresetBrandColorType, PresetColorType, PresetStatusColorType } from 'types/colors';

export interface TagPropsType {
  selected?: boolean;
  closable?: boolean;
  onClose?: () => void;
  afterClose?: () => void;
  icon?: React.ReactNode;
  bgType?: 'default' | 'gray' | 'filled';
  shape?: 'default' | 'square' | 'round';
  color?: LiteralUnion<PresetColorType | PresetStatusColorType | PresetBrandColorType>;
  bgColor?: string;
}
