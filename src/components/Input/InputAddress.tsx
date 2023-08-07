import React, { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Platform, StyleProp, StyleSheet, TextInput, View } from 'react-native';
import { DisabledStyle, FontMedium } from 'styles/sharedStyles';
import { Scan } from 'phosphor-react-native';
import reformatAddress, { toShort } from 'utils/index';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { isValidSubstrateAddress } from '@subwallet/extension-base/utils';
import { Avatar, Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';
import { setAdjustResize } from 'rn-android-keyboard-adjust';

interface InputProps {
  label?: string;
  value: string;
  containerStyle?: StyleProp<any>;
  onChange: (output: string | null, currentValue: string) => void;
  onSubmitField?: () => void;
  onPressQrButton: () => void;
  isValidValue?: boolean;
  showAvatar?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
}

const isValidCurrentAddress = (address: string, isEthereum: boolean) => {
  if (isEthereum) {
    return isEthereumAddress(address);
  } else {
    return isValidSubstrateAddress(address);
  }
};

const Component = (inputAddressProps: InputProps, ref: ForwardedRef<any>) => {
  const {
    containerStyle,
    disabled,
    readonly,
    label,
    onChange,
    onPressQrButton,
    value,
    isValidValue = true,
    showAvatar = true,
    onSubmitField,
    placeholder,
  } = inputAddressProps;
  const theme = useSubWalletTheme().swThemes;
  const [isInputBlur, setInputBlur] = useState<boolean>(true);
  const [address, setAddress] = useState<string>(value);
  const themes = useSubWalletTheme().swThemes;
  const isAddressValid = isValidCurrentAddress(address, isEthereumAddress(address)) && isValidValue;
  const hasLabel = !!label;
  const styles = useMemo(
    () => createStyle(theme, hasLabel, isAddressValid, showAvatar, readonly),
    [theme, hasLabel, isAddressValid, showAvatar, readonly],
  );

  useEffect(() => setAdjustResize(), []);

  const onChangeInputText = (rawText: string) => {
    const text = rawText.trim();
    setAddress(text);

    if (isValidCurrentAddress(text, isEthereumAddress(text))) {
      onChange(reformatAddress(text, 42), text);
    } else {
      onChange(null, text);
    }
  };
  const onInputFocus = () => {
    setInputBlur(false);
  };
  const onInputBlur = () => {
    setInputBlur(true);
  };

  useImperativeHandle(ref, () => ({
    onChange: (input: string) => {
      setAddress(input);
      setInputBlur(true);
      if (isAddress(input)) {
        onChange(reformatAddress(input, 42), input);
      } else {
        onChange(null, input);
      }
    },
  }));

  const isInputVisible = !address || !isInputBlur;

  return (
    <View
      style={[
        styles.inputContainer,
        containerStyle,
        { backgroundColor: themes.colorBgSecondary },
        disabled && DisabledStyle,
      ]}>
      {hasLabel && <Typography.Text style={styles.inputLabel}>{label}</Typography.Text>}
      <View style={styles.blockContent}>
        {showAvatar && (
          <>
            {isAddressValid ? (
              <Avatar value={address || ''} size={hasLabel ? 20 : 24} />
            ) : (
              <View style={styles.identiconPlaceholder} />
            )}
          </>
        )}

        <Typography.Text style={{ ...styles.formattedTextInput, opacity: isInputVisible ? 0 : 1 }}>
          {toShort(address, 9, 9)}
        </Typography.Text>
      </View>

      <TextInput
        autoCorrect={false}
        autoFocus={false}
        placeholder={placeholder}
        style={[styles.textInput, { opacity: isInputVisible ? 1 : 0 }]}
        placeholderTextColor={themes.colorTextLight4}
        selectionColor={themes.colorTextLight4}
        blurOnSubmit={true}
        value={address}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        onChangeText={onChangeInputText}
        editable={!disabled && !readonly}
        onSubmitEditing={onSubmitField}
      />

      <Button
        style={styles.qrButton}
        disabled={disabled || readonly}
        size={'xs'}
        type={'ghost'}
        onPress={onPressQrButton}
        icon={
          <Icon phosphorIcon={Scan} size={'sm'} iconColor={readonly ? theme.colorTextLight5 : theme.colorTextLight3} />
        }
      />
    </View>
  );
};

function createStyle(theme: ThemeTypes, hasLabel: boolean, isValid: boolean, showAvatar?: boolean, readonly?: boolean) {
  return StyleSheet.create({
    inputContainer: {
      borderRadius: theme.borderRadiusLG,
      backgroundColor: theme.colorBgSecondary,
      width: '100%',
      position: 'relative',
    },
    blockContent: {
      flexDirection: 'row',
      height: 48,
      alignItems: 'center',
      paddingRight: 44,
      paddingLeft: theme.sizeSM,
    },
    inputLabel: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      marginBottom: -4,
      paddingTop: theme.paddingXS,
      paddingHorizontal: theme.sizeSM,
      color: theme.colorTextLight4,
    },
    identiconPlaceholder: {
      backgroundColor: theme.colorTextLight4,
      borderRadius: hasLabel ? 20 : 24,
      width: hasLabel ? 20 : 24,
      height: hasLabel ? 20 : 24,
    },
    textInput: {
      ...FontMedium,
      position: 'absolute',
      flex: 1,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      paddingLeft: (showAvatar ? (hasLabel ? 20 : 24) + theme.sizeXS : 0) + theme.sizeSM,
      paddingRight: 52,
      paddingTop: (hasLabel ? 24 : 0) + 13,
      paddingBottom: 13,
      color: isValid ? (readonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
      lineHeight: Platform.OS === 'ios' ? 17 : theme.fontSize * theme.lineHeight,
      zIndex: 1,
    },
    formattedTextInput: {
      ...FontMedium,
      flex: 1,
      opacity: 0,
      paddingRight: theme.paddingXS,
      paddingLeft: showAvatar ? theme.paddingXS : 0,
      color: isValid ? (readonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
    },
    qrButton: {
      position: 'absolute',
      right: 4,
      bottom: 4,
      zIndex: 2,
    },
  });
}

export const InputAddress = forwardRef(Component);
