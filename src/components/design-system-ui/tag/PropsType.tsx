import { LiteralUnion } from '@subwallet/react-ui/es/_util/type';
import { PresetBrandColorType, PresetColorType, PresetStatusColorType } from '@subwallet/react-ui/es/_util/colors';
import React from 'react';

export interface TagPropsType {
  selected?: boolean;
  closable?: boolean;
  onClose?: () => void;
  afterClose?: () => void;
  icon?: React.ReactNode;
  bgType?: 'default' | 'gray' | 'filled';
  shape?: 'default' | 'square' | 'round';
  color?: LiteralUnion<PresetColorType | PresetStatusColorType | PresetBrandColorType>;
}
