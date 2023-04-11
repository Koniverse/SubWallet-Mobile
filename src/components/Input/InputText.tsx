import React, { forwardRef } from 'react';
import { StyleProp, TextInput, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import { Warning } from 'components/Warning';

interface Props extends FieldBaseProps {
  onChangeText?: (text: string) => void;
  onEndEditing?: () => void;
  onBlur?: () => void;
  errorMessages?: string[];
  isBusy?: boolean;
  autoFocus?: boolean;
  onSubmitField?: () => void;
  defaultValue?: string;
  value: string;
}

const blockContentStyle: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingBottom: 12,
};

function getInputStyle(isError: boolean) {
  return {
    ...FontSize2,
    paddingTop: 0,
    paddingBottom: 0,
    height: 25,
    flex: 1,
    paddingRight: 16,
    ...FontMedium,
    color: isError ? ColorMap.danger : ColorMap.light,
  };
}

const InputText = forwardRef((passwordFieldProps: Props, ref: React.Ref<TextInput>) => {
  const {
    defaultValue,
    onChangeText,
    onEndEditing,
    onBlur,
    errorMessages,
    isBusy,
    autoFocus,
    onSubmitField,
    value,
    label,
    ...fieldBase
  } = passwordFieldProps;
  return (
    <>
      <FieldBase label={label} {...fieldBase}>
        <View style={[blockContentStyle, !label && { paddingTop: 12 }]}>
          <TextInput
            ref={ref}
            autoCorrect={false}
            autoCapitalize={'none'}
            autoFocus={autoFocus}
            style={getInputStyle(!!(errorMessages && errorMessages.length))}
            placeholderTextColor={ColorMap.disabled}
            selectionColor={ColorMap.disabled}
            blurOnSubmit={false}
            onSubmitEditing={onSubmitField}
            onChangeText={onChangeText}
            onEndEditing={onEndEditing}
            defaultValue={defaultValue || ''}
            onBlur={onBlur}
            editable={!isBusy}
            selectTextOnFocus={!isBusy}
            value={value}
          />
        </View>
      </FieldBase>

      {!!(errorMessages && errorMessages.length) &&
        errorMessages.map((message, index) => (
          <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
        ))}
    </>
  );
});

export default React.memo(InputText);
