import React from 'react';
import { StyleProp, Text, TextInput, TextInputProps, View } from 'react-native';
import { FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface Props extends TextInputProps {
  inputValue: string;
  isDisabled?: boolean;
  label: string;
  editAccountInputStyle?: object;
  outerInputStyle?: object;
}

const inputWrapper: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  width: '100%',
  borderRadius: 5,
  height: 64,
  paddingHorizontal: 16,
  paddingTop: 4,
  paddingBottom: 10,
  justifyContent: 'center',
};
const labelStyle: StyleProp<any> = {
  ...sharedStyles.smallText,
  ...FontSize0,
  lineHeight: 25,
  ...FontMedium,
  color: ColorMap.disabled,
};
const inputStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  lineHeight: 20,
  paddingTop: 5,
  paddingBottom: 5,
  ...FontMedium,
  color: ColorMap.light,
};

export const EditAccountInputText = (inputProps: Props) => {
  const { inputValue, isDisabled = false, label, editAccountInputStyle, outerInputStyle } = inputProps;

  return (
    <View style={[inputWrapper, editAccountInputStyle]}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        style={[inputStyle, outerInputStyle]}
        value={inputValue}
        {...inputProps}
        editable={!isDisabled}
        selectTextOnFocus={!isDisabled}
      />
    </View>
  );
};
