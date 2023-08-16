import React, { forwardRef, useMemo, useState } from 'react';
import { Platform, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { ColorMap } from 'styles/color';
import { DisabledStyle, FontMedium } from 'styles/sharedStyles';
import { FieldBaseProps } from 'components/Field/Base';
import { Warning } from 'components/Warning';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { ThemeTypes } from 'styles/themes';
import { Eye, EyeSlash } from 'phosphor-react-native';

interface Props extends FieldBaseProps {
  onChangeText?: (text: string) => void;
  onEndEditing?: () => void;
  onBlur?: () => void;
  errorMessages?: string[];
  isBusy?: boolean;
  autoFocus?: boolean;
  onSubmitField?: () => void;
  defaultValue?: string;
  showEyeButton?: boolean;
  placeholder?: string;
  containerStyle?: ViewStyle;
  disabled?: boolean;
}

export const PasswordField = forwardRef((passwordFieldProps: Props, ref: React.Ref<TextInput>) => {
  const {
    defaultValue,
    onChangeText,
    onEndEditing,
    onBlur,
    errorMessages,
    isBusy,
    autoFocus,
    onSubmitField,
    showEyeButton = true,
    placeholder,
    containerStyle,
    disabled,
    label,
  } = passwordFieldProps;
  const [isShowPassword, setShowPassword] = useState<boolean>(false);
  const theme = useSubWalletTheme().swThemes;
  const hasLabel = !!label;
  const styles = useMemo(
    () => createStyle(theme, hasLabel, !(errorMessages && errorMessages.length)),
    [theme, hasLabel, errorMessages],
  );

  return (
    <>
      <View
        style={[
          styles.inputContainer,
          containerStyle,
          { backgroundColor: theme.colorBgSecondary },
          disabled && DisabledStyle,
        ]}>
        {hasLabel && <Typography.Text style={styles.inputLabel}>{label}</Typography.Text>}

        <TextInput
          ref={ref}
          autoCorrect={false}
          autoFocus={autoFocus}
          style={styles.textInput}
          placeholderTextColor={theme.colorTextTertiary}
          selectionColor={ColorMap.disabled}
          secureTextEntry={!isShowPassword}
          blurOnSubmit={false}
          onSubmitEditing={onSubmitField}
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
          defaultValue={defaultValue || ''}
          onBlur={onBlur}
          textContentType="oneTimeCode"
          editable={!isBusy}
          selectTextOnFocus={!isBusy}
          placeholder={placeholder}
        />

        <View style={{ position: 'absolute', right: 2, bottom: 4, zIndex: 10 }}>
          {showEyeButton && (
            <>
              {isShowPassword ? (
                <Button
                  disabled={isBusy}
                  onPress={() => setShowPassword(false)}
                  size={'xs'}
                  type={'ghost'}
                  icon={<Icon phosphorIcon={EyeSlash} weight={'bold'} size={'sm'} iconColor={theme.colorTextLight3} />}
                />
              ) : (
                <Button
                  disabled={isBusy}
                  onPress={() => setShowPassword(true)}
                  size={'xs'}
                  type={'ghost'}
                  icon={<Icon phosphorIcon={Eye} weight={'bold'} size={'sm'} iconColor={theme.colorTextLight3} />}
                />
              )}
            </>
          )}
        </View>
      </View>

      <View style={{ marginTop: 8 }}>
        {!!(errorMessages && errorMessages.length) &&
          errorMessages.map((message, index) => (
            <Warning style={{ marginBottom: 8 }} key={index} isDanger message={message} />
          ))}
      </View>
    </>
  );
});

function createStyle(theme: ThemeTypes, hasLabel: boolean, isValid: boolean, readonly?: boolean) {
  return StyleSheet.create({
    inputContainer: {
      borderRadius: theme.borderRadiusLG,
      backgroundColor: theme.colorBgSecondary,
      width: '100%',
      position: 'relative',
      height: hasLabel ? 72 : 48,
    },
    inputLabel: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
      marginBottom: -4,
      paddingTop: theme.paddingXS,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      paddingHorizontal: theme.sizeSM,
      color: theme.colorTextLight4,
    },
    textInput: {
      ...FontMedium,
      position: 'absolute',
      flex: 1,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingLeft: theme.sizeSM,
      paddingRight: 52,
      paddingTop: (hasLabel ? 24 : 0) + 13,
      paddingBottom: 13,
      color: isValid ? (readonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
      lineHeight: Platform.OS === 'ios' ? 17 : theme.lineHeight * theme.fontSize,
      fontSize: theme.fontSize,
      zIndex: 1,
    },
  });
}
