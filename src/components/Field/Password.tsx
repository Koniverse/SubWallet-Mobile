import React, { useState } from 'react';
import { Keyboard, StyleProp, TextInput, TouchableOpacity, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSize2 } from 'styles/sharedStyles';
import { FieldBase, FieldBaseProps } from 'components/Field/Base';
import { BUTTON_ACTIVE_OPACITY } from '../../constant';
import { Eye, EyeSlash } from 'phosphor-react-native';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';

interface Props extends FieldBaseProps {
  onChangeText?: (text: string) => void;
  onEndEditing?: () => void;
  onBlur?: () => void;
  value?: string;
  isError?: boolean;
  isBusy?: boolean;
  autoFocus?: boolean;
}

const blockContentStyle: StyleProp<any> = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingBottom: 8,
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

export const PasswordField = ({
  onChangeText,
  onEndEditing,
  onBlur,
  value,
  isError,
  isBusy,
  autoFocus = true,
  ...fieldBase
}: Props) => {
  const [isShowPassword, setShowPassword] = useState<boolean>(false);
  const isPasswordTooShort = value && value.length < 6;
  return (
    <>
      <FieldBase {...fieldBase}>
        <View style={blockContentStyle}>
          <TextInput
            autoCorrect={false}
            autoFocus={autoFocus}
            style={getInputStyle(!!isError)}
            placeholderTextColor={ColorMap.disabled}
            selectionColor={ColorMap.disabled}
            secureTextEntry={!isShowPassword}
            blurOnSubmit={false}
            onSubmitEditing={() => Keyboard.dismiss()}
            onChangeText={onChangeText}
            onEndEditing={onEndEditing}
            onBlur={onBlur}
            value={value}
            editable={!isBusy}
            selectTextOnFocus={!isBusy}
          />

          {isShowPassword ? (
            <TouchableOpacity
              disabled={isBusy}
              activeOpacity={BUTTON_ACTIVE_OPACITY}
              onPress={() => setShowPassword(false)}>
              <EyeSlash color={isBusy ? ColorMap.disabled : ColorMap.light} weight={'bold'} size={20} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              disabled={isBusy}
              activeOpacity={BUTTON_ACTIVE_OPACITY}
              onPress={() => setShowPassword(true)}>
              <Eye color={isBusy ? ColorMap.disabled : ColorMap.light} weight={'bold'} size={20} />
            </TouchableOpacity>
          )}
        </View>
      </FieldBase>

      {!!isPasswordTooShort && (
        <Warning isDanger message={i18n.warningMessage.passwordTooShort} style={{ marginBottom: 8 }} />
      )}
    </>
  );
};
