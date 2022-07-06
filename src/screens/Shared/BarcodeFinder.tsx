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
  borderTopLeftRadius: 3,
  width: 20,
  height: 20,
};

const topRightEdge: StyleProp<any> = {
  position: 'absolute',
  top: 0,
  right: 0,
  borderTopRightRadius: 3,
  width: 20,
  height: 20,
};

const bottomLeftEdge: StyleProp<any> = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  borderBottomLeftRadius: 3,
  width: 20,
  height: 20,
};

const bottomRightEdge: StyleProp<any> = {
  position: 'absolute',
  bottom: 0,
  right: 0,
  borderBottomRightRadius: 3,
  width: 20,
  height: 20,
};

export const BarcodeFinder = ({ width, height, borderColor, borderWidth }: Props) => {
  return (
    <View style={container}>
      <View style={[finder, { width, height }]}>
        <View
          style={[
            { borderColor: borderColor },
            topLeftEdge,
            {
              borderLeftWidth: borderWidth,
              borderTopWidth: borderWidth,
            },
          ]}
        />
        <View
          style={[
            { borderColor: borderColor },
            topRightEdge,
            {
              borderRightWidth: borderWidth,
              borderTopWidth: borderWidth,
            },
          ]}
        />
        <View
          style={[
            { borderColor: borderColor },
            bottomLeftEdge,
            {
              borderLeftWidth: borderWidth,
              borderBottomWidth: borderWidth,
            },
          ]}
        />
        <View
          style={[
            { borderColor: borderColor },
            bottomRightEdge,
            {
              borderRightWidth: borderWidth,
              borderBottomWidth: borderWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};
