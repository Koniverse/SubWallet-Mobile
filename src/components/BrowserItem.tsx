import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';

interface Props {
  leftIcon: JSX.Element;
  text: string;
  onPress: () => void;
}

export const BrowserItem = ({ leftIcon, text, onPress }: Props) => {
  return (
    <TouchableOpacity style={{ marginBottom: 8 }} onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 40,
            height: 40,
            backgroundColor: ColorMap.dark2,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {leftIcon}
        </View>

        <Text style={{ ...sharedStyles.mainText, color: ColorMap.light, ...FontMedium, paddingLeft: 12 }}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};
