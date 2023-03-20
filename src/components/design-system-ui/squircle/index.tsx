import React from 'react';
import { StyleProp, View } from 'react-native';
// @ts-ignore
import SuperEllipseMask from 'react-native-super-ellipse-mask';

interface Props {
  backgroundColor?: string;
  children?: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  customSize?: number;
  customStyle?: StyleProp<any>;
}

const SIZE_MAP: Record<string, number> = {
  xs: 40,
  sm: 48,
  md: 52,
  lg: 64,
  xl: 72,
};

const Squircle: React.FC<Props> = ({ children, customSize, size = 'md', backgroundColor = '#004BFF', customStyle }) => {
  const squircleSize = customSize ? customSize : size ? SIZE_MAP[size] : 52;
  return (
    <SuperEllipseMask radius={squircleSize / 2.5}>
      <View
        style={[
          {
            width: squircleSize,
            height: squircleSize,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: backgroundColor,
          },
          customStyle,
        ]}>
        {children}
      </View>
    </SuperEllipseMask>
  );
};

export default Squircle;
