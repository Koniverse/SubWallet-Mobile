import React from 'react';
import { StyleProp, View } from 'react-native';

interface Props {
  width: number;
  height: number;
  borderColor: string;
  borderWidth: number;
}

const container: StyleProp<any> = {
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

const finder: StyleProp<any> = {
  alignItems: 'center',
  justifyContent: 'center',
};

const topLeftEdge: StyleProp<any> = {
  position: 'absolute',
  top: 0,
  left: 0,
  borderStyle: 'dashed',
  width: '100%',
  height: '100%',
};

export const BarcodeFinder = ({ width, height, borderColor, borderWidth }: Props) => {
  return (
    <View style={container}>
      <View style={[finder, { width, height }]}>
        <View
          style={[
            topLeftEdge,
            {
              borderColor: borderColor,
              borderWidth: borderWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};
