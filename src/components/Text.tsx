import React from 'react';
import { Text, TextProps } from 'react-native';
import { ALLOW_FONT_SCALING } from 'constants/index';

const TextComponent = (props: TextProps) => {
  return (
    <Text allowFontScaling={ALLOW_FONT_SCALING} {...props}>
      {props.children}
    </Text>
  );
};

export default TextComponent;
