import React from 'react';
import { ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import MaskedView from '@react-native-masked-view/masked-view';

interface Props {
  backgroundColor?: string;
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  customSize?: number;
  customStyle?: ViewStyle;
  squircleStyle?: ViewStyle;
}

export const SIZE_MAP: Record<string, number> = {
  xs: 40,
  sm: 48,
  md: 52,
  lg: 64,
  xl: 72,
};

const Squircle: React.FC<Props> = ({ children, customSize, size = 'md', backgroundColor = '#004BFF', customStyle }) => {
  const squircleSize = customSize ? customSize : size ? SIZE_MAP[size] : 52;
  return (
    <MaskedView
      style={[{ position: 'relative', width: squircleSize, height: squircleSize, backgroundColor }, customStyle]}
      maskElement={
        <Svg width={squircleSize} height={squircleSize} viewBox="0 0 64 64">
          <Path
            d="M32 0C56.2653 0 64 7.73474 64 32C64 56.2653 56.2653 64 32 64C7.73473 64 0 56.2653 0 32C0 7.73474 7.73473 0 32 0Z"
            fill={'#000'}
          />
        </Svg>
      }>
      {children}
    </MaskedView>
  );
};

export default Squircle;
