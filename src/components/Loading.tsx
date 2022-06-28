import { Image, StyleProp, View } from 'react-native';
import React from 'react';
import { Images } from 'assets/index';

interface Props {
  style?: StyleProp<any>;
  width: number;
  height: number;
}

const Loading = ({ style, width, height }: Props) => {
  return (
    <View style={style || {}}>
      <Image
        style={{
          width,
          height,
        }}
        source={Images.loading}
      />
    </View>
  );
};

export default Loading;
