import React, { forwardRef } from 'react';
import { StyleProp, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { FontMedium, FontSize0, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { Warning } from 'components/Warning';
import { Typography } from 'components/design-system-ui';
import { AccountProxyTypeTag } from 'components/AccountProxy/AccountProxyTypeTag';
import { AccountProxyType } from '@subwallet/extension-base/types';

interface Props extends TextInputProps {
  isDisabled?: boolean;
  label: string;
  editAccountInputStyle?: StyleProp<ViewStyle>;
  outerInputStyle?: StyleProp<TextStyle>;
  errorMessages?: string[];
  onSubmitField?: () => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  accountType?: AccountProxyType;
}

const inputWrapper: StyleProp<any> = {
  backgroundColor: '#1A1A1A',
  width: '100%',
  borderRadius: 8,
  paddingLeft: 16,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 2,
  justifyContent: 'center',
};
const labelStyle: StyleProp<any> = {
  ...sharedStyles.smallText,
  ...FontSize0,
  lineHeight: 25,
  ...FontMedium,
  color: ColorMap.disabled,
};

const contentWrapper: StyleProp<ViewStyle> = {
  display: 'flex',
  flexDirection: 'row',
  gap: 8,
  alignItems: 'center',
};
const inputStyle: StyleProp<any> = {
  fontSize: 14,
  paddingTop: 5,
  paddingBottom: 5,
  ...FontMedium,
  color: ColorMap.light,
  flex: 1,
};

export const EditAccountInputText = forwardRef((inputProps: Props, ref: React.Ref<TextInput>) => {
  const {
    isDisabled = false,
    label,
    editAccountInputStyle,
    outerInputStyle,
    errorMessages,
    onSubmitField,
    prefix,
    suffix,
    accountType,
  } = inputProps;

  return (
    <>
      <View style={[inputWrapper, editAccountInputStyle]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Typography.Text style={labelStyle}>{label}</Typography.Text>

          <AccountProxyTypeTag type={accountType} />
        </View>

        <View style={contentWrapper}>
          {prefix}
          <TextInput
            {...inputProps}
            ref={ref}
            autoCorrect={false}
            blurOnSubmit={false}
            onSubmitEditing={onSubmitField}
            style={[inputStyle, outerInputStyle]}
            editable={!isDisabled}
            textContentType="oneTimeCode"
            selectTextOnFocus={!isDisabled}
          />
          {suffix}
        </View>
      </View>

      {!!(errorMessages && errorMessages.length) &&
        errorMessages.map((message, index) => (
          <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
        ))}
    </>
  );
});
