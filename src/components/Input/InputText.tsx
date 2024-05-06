import React, { forwardRef, useMemo } from 'react';
import { KeyboardTypeOptions, Platform, StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import { DisabledStyle, FontMedium } from 'styles/sharedStyles';
import { FieldBaseProps } from 'components/Field/Base';
import { Warning } from 'components/Warning';
import { Icon, Typography } from 'components/design-system-ui';
import { IconProps } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';

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
  placeholder?: string;
  leftIcon?: React.ElementType<IconProps>;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  extraTextInputStyle?: ViewStyle;
  readonly?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
}

const InputText = forwardRef((passwordFieldProps: Props, ref: React.Ref<TextInput>) => {
  const theme = useSubWalletTheme().swThemes;
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
    placeholder,
    leftIcon,
    rightIcon,
    disabled,
    containerStyle,
    extraTextInputStyle,
    readonly,
    maxLength,
    keyboardType,
  } = passwordFieldProps;
  const hasLabel = !!label;
  const styles = useMemo(
    () => createStyle(theme, hasLabel, !(errorMessages && errorMessages.length), !!leftIcon, readonly),
    [theme, hasLabel, errorMessages, leftIcon, readonly],
  );

  return (
    <>
      <View style={[styles.inputContainer, containerStyle, disabled && DisabledStyle]}>
        {hasLabel && <Typography.Text style={styles.inputLabel}>{label}</Typography.Text>}
        <>
          {leftIcon && (
            <View style={{ position: 'absolute', top: (hasLabel ? 26 : 0) + 12, left: 12 }}>
              <Icon size={'md'} phosphorIcon={leftIcon} iconColor={theme.colorTextLight5} />
            </View>
          )}
          <TextInput
            ref={ref}
            autoCorrect={false}
            autoCapitalize={'none'}
            placeholder={placeholder}
            autoFocus={autoFocus}
            style={[styles.textInput, extraTextInputStyle]}
            placeholderTextColor={theme.colorTextLight4}
            selectionColor={theme.colorTextLight4}
            blurOnSubmit={false}
            onSubmitEditing={onSubmitField}
            onChangeText={onChangeText}
            onEndEditing={onEndEditing}
            defaultValue={defaultValue || ''}
            onBlur={onBlur}
            editable={!isBusy}
            keyboardType={keyboardType}
            selectTextOnFocus={!isBusy}
            maxLength={maxLength}
            value={value}
          />
          {rightIcon}
        </>
      </View>

      {!!(errorMessages && errorMessages.length) &&
        errorMessages.map((message, index) => (
          <Warning key={index} isDanger message={message} style={{ marginBottom: 8 }} />
        ))}
    </>
  );
});

function createStyle(theme: ThemeTypes, hasLabel: boolean, isValid: boolean, leftIcon: boolean, readonly?: boolean) {
  return StyleSheet.create({
    inputContainer: {
      borderRadius: theme.borderRadiusLG,
      backgroundColor: theme.colorBgSecondary,
      width: '100%',
      position: 'relative',
      marginBottom: 8,
      height: hasLabel ? 72 : 48,
    },
    inputLabel: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
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
      paddingLeft: leftIcon ? theme.sizeSM + 32 : theme.sizeSM,
      paddingRight: 14,
      paddingTop: (hasLabel ? 26 : 0) + 14,
      paddingBottom: 13,
      color: isValid ? (readonly ? theme.colorTextLight4 : theme.colorTextLight1) : theme.colorError,
      lineHeight: Platform.OS === 'ios' ? 18 : theme.lineHeight * theme.fontSize,
      fontSize: theme.fontSize,
      zIndex: 1,
      borderRadius: theme.borderRadiusLG,
    },
  });
}

export default React.memo(InputText);
