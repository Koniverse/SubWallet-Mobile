import React, { forwardRef } from 'react';
import { StyleProp, TextInput, TextInputProps, View } from 'react-native';
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
  const {
    style,
    onChangeText,
    value,
    onBlur,
    onEndEditing,
    autoFocus,
    onSubmitEditing,
    errorMessages,
    placeholder,
    placeholderTextColor,
    blurOnSubmit = true,
    editable,
  } = textAreaProps;
  return (
    <>
      <TextInput
        ref={ref}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        autoCorrect={false}
        autoFocus={autoFocus}
        autoCapitalize="none"
        blurOnSubmit={blurOnSubmit}
        style={[sharedStyles.inputAreaStyle, textAreaWrapper, style]}
        multiline={true}
        onChangeText={onChangeText}
        onBlur={onBlur}
        onEndEditing={onEndEditing}
        value={value}
        onSubmitEditing={onSubmitEditing}
        editable={editable}
      />

      <View style={{ paddingTop: 8 }}>
        {!!(errorMessages && errorMessages.length) &&
          errorMessages.map((message, index) => (
            <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
          ))}
      </View>
    </>
  );
});
