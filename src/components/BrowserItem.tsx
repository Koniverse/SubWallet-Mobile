import React from 'react';
import { StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';

interface Props {
  leftIcon: JSX.Element;
  text: string;
  onPress: () => void;
}

const leftIconWrapperStyle: StyleProp<any> = {
  width: 40,
  height: 40,
  backgroundColor: ColorMap.dark2,
  borderRadius: 5,
  justifyContent: 'center',
  alignItems: 'center',
};

const textStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.light,
  ...FontMedium,
  paddingLeft: 12,
  flex: 1,
};

export const BrowserItem = ({ leftIcon, text, onPress }: Props) => {
  return (
    <TouchableOpacity style={{ paddingVertical: 4, paddingHorizontal: 16 }} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
        <View style={leftIconWrapperStyle}>{leftIcon}</View>
        <Text numberOfLines={1} style={textStyle}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
