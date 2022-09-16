import React from 'react';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';

interface Props {
  style: StyleProp<any>;
  color?: string;
}

function getDividerStyle(color: string) {
  return { height: 1, width: '100%', backgroundColor: color };
}

export const Divider = ({ style, color = ColorMap.disabled }: Props) => {
  return (
    <View style={[style, { width: '100%' }]}>
      <View style={getDividerStyle(color)} />
    </View>
  );
};
