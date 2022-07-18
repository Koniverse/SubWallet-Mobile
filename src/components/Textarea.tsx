import React from 'react';
import { StyleProp, TextInput, TextInputProps } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

const textAreaWrapper: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  width: '100%',
  color: ColorMap.disabled,
};

export const Textarea = (textAreaProps: TextInputProps) => {
  const { style, onChangeText, value, onBlur, onEndEditing, autoFocus } = textAreaProps;
  return (
    <TextInput
      autoFocus={autoFocus}
      autoCapitalize="none"
      style={[sharedStyles.inputAreaStyle, textAreaWrapper, style]}
      multiline={true}
      onChangeText={onChangeText}
      onBlur={onBlur}
      onEndEditing={onEndEditing}
      value={value}
    />
  );
};
