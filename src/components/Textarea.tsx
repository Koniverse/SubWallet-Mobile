import React, { forwardRef } from 'react';
import { StyleProp, TextInput, TextInputProps } from 'react-native';
import { sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Warning } from 'components/Warning';

const textAreaWrapper: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  width: '100%',
  color: ColorMap.disabled,
};

interface Props extends TextInputProps {
  errorMessages?: string[];
}

export const Textarea = forwardRef((textAreaProps: Props, ref: React.Ref<TextInput>) => {
  const { style, onChangeText, value, onBlur, onEndEditing, autoFocus, onSubmitEditing, errorMessages } = textAreaProps;
  return (
    <>
      <TextInput
        ref={ref}
        returnKeyType="go"
        autoCorrect={false}
        autoFocus={autoFocus}
        autoCapitalize="none"
        blurOnSubmit={false}
        style={[sharedStyles.inputAreaStyle, textAreaWrapper, style]}
        multiline={true}
        onChangeText={onChangeText}
        onBlur={onBlur}
        onEndEditing={onEndEditing}
        value={value}
        onSubmitEditing={onSubmitEditing}
      />

      {!!(errorMessages && errorMessages.length) &&
        errorMessages.map((message, index) => (
          <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
        ))}
    </>
  );
});
