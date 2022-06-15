import React from 'react';
import { StyleProp, TextInput } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

const textAreaWrapper: StyleProp<any> = {
  backgroundColor: ColorMap.inputBackground,
  width: '100%',
  color: ColorMap.disabled,
};

export const Textarea = () => {
  return <TextInput autoCapitalize="none" style={[sharedStyles.inputAreaStyle, textAreaWrapper]} multiline={true} />;
};
