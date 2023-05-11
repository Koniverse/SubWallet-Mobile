import React, { ForwardedRef, forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { DisabledStyle, FontMedium } from 'styles/sharedStyles';
import { Scan } from 'phosphor-react-native';
import reformatAddress, { toShort } from 'utils/index';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { isValidSubstrateAddress } from '@subwallet/extension-base/utils';
import { Avatar, Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ThemeTypes } from 'styles/themes';

interface InputProps {
  label: string;
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
    () => createStyle(theme, hasLabel, isAddressValid, readonly),
    [readonly, hasLabel, isAddressValid, theme],
  );
  const onChangeInputText = (rawText: string) => {
    const text = rawText.trim();
    setAddress(text);

    if (isValidCurrentAddress(text, isEthereumAddress(text))) {
      onChange(reformatAddress(text, 42), text);
    } else {
      onChange(null, text);
    }
  };
  const onPressContainer = () => {
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

  return (
    <View
      style={[
        styles.inputContainer,
        containerStyle,
        { backgroundColor: themes.colorBgSecondary },
        disabled && DisabledStyle,
      ]}>
      <TouchableOpacity activeOpacity={1} onPress={onPressContainer} disabled={disabled || readonly}>
        <Typography.Text style={styles.inputLabel}>{label}</Typography.Text>
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
          {!isInputBlur || !address ? (
            <TextInput
              autoCorrect={false}
              autoFocus={true}
              placeholder={placeholder}
              style={styles.textInput}
              placeholderTextColor={themes.colorTextLight4}
              selectionColor={themes.colorTextLight4}
              blurOnSubmit={true}
              value={address}
              onBlur={onInputBlur}
              onChangeText={onChangeInputText}
              editable={!disabled && !readonly}
              onSubmitEditing={onSubmitField}
            />
          ) : (
            <Typography.Text style={styles.formattedTextInput}>{toShort(address, 9, 9)}</Typography.Text>
          )}
        </View>
      </TouchableOpacity>

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

function createStyle(theme: ThemeTypes, hasLabel: boolean, isValid: boolean, readonly?: boolean) {
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
      paddingLeft: theme.size,
    },
    inputLabel: {
      ...FontMedium,
      fontSize: theme.fontSizeSM,
      lineHeight: theme.fontSizeSM * theme.lineHeightSM,
      marginBottom: -2,
      paddingTop: theme.paddingXS,
      paddingHorizontal: theme.size,
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
      flex: 1,
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: theme.paddingXS,
      color: isValid ? (readonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
    },
    formattedTextInput: {
      ...FontMedium,
      flex: 1,
      paddingHorizontal: theme.paddingXS,
      color: isValid ? (readonly ? theme.colorTextLight5 : theme.colorTextLight1) : theme.colorError,
    },
    qrButton: {
      position: 'absolute',
      right: 4,
      bottom: 4,
    },
  });
}

export const InputAddress = forwardRef(Component);
