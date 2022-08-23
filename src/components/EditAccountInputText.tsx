import React, { forwardRef } from 'react';
import { StyleProp, TextInput, TextInputProps, View } from 'react-native';
import { FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import Text from '../components/Text';
import { Warning } from 'components/Warning';

interface Props extends TextInputProps {
  isDisabled?: boolean;
  label: string;
  editAccountInputStyle?: object;
  outerInputStyle?: object;
  errorMessages?: string[];
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

export const EditAccountInputText = forwardRef((inputProps: Props, ref: React.Ref<TextInput>) => {
  const { isDisabled = false, label, editAccountInputStyle, outerInputStyle, errorMessages } = inputProps;

  return (
    <>
      <View style={[inputWrapper, editAccountInputStyle]}>
        <Text style={labelStyle}>{label}</Text>
        <TextInput
          ref={ref}
          autoCorrect={false}
          style={[inputStyle, outerInputStyle]}
          {...inputProps}
          editable={!isDisabled}
          selectTextOnFocus={!isDisabled}
        />
      </View>

      {!!(errorMessages && errorMessages.length) &&
        errorMessages.map((message, index) => (
          <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
        ))}
    </>
  );
});
