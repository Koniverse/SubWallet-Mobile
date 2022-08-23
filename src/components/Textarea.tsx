import React, { forwardRef } from 'react';
import { StyleProp, TextInput, TextInputProps } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

const textAreaWrapper: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  width: '100%',
  color: ColorMap.disabled,
};

export const Textarea = forwardRef((textAreaProps: TextInputProps, ref: React.Ref<TextInput>) => {
  const { style, onChangeText, value, onBlur, onEndEditing, autoFocus, onSubmitEditing } = textAreaProps;
  return (
    <TextInput
      ref={ref}
      returnKeyType="go"
      autoCorrect={false}
      autoFocus={autoFocus}
      autoCapitalize="none"
      blurOnSubmit={true}
      style={[sharedStyles.inputAreaStyle, textAreaWrapper, style]}
      multiline={true}
      onChangeText={onChangeText}
      onBlur={onBlur}
      onEndEditing={onEndEditing}
      value={value}
      onSubmitEditing={onSubmitEditing}
    />
  );
});
