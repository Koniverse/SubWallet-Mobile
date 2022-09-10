import React from 'react';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';

interface Props {
  style: StyleProp<any>;
}

const dividerStyle: StyleProp<any> = { height: 1, width: '100%', backgroundColor: ColorMap.disabled };

export const Divider = ({ style }: Props) => {
  return (
    <View style={[style, { width: '100%' }]}>
      <View style={dividerStyle} />
    </View>
  );
};
