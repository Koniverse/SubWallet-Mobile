import React, { ForwardedRef, forwardRef, useImperativeHandle, useState } from 'react';
import { StyleProp, TextInput, TouchableOpacity, View } from 'react-native';
import Text from '../Text';
import { FontMedium, FontSize0, FontSize2, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { QrCode } from 'phosphor-react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { SubWalletAvatar } from 'components/SubWalletAvatar';
import reformatAddress, { toShort } from 'utils/index';
import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import { isValidSubstrateAddress } from '@subwallet/extension-base/utils';

interface InputProps {
  label: string;
  value: string;
  containerStyle?: StyleProp<any>;
  onChange: (output: string | null, currentValue: string) => void;
  onPressQrButton: () => void;
  isValidValue?: boolean;
  showAvatar?: boolean;
  disable?: boolean;
}

const getInputContainerStyle: StyleProp<any> = (style: StyleProp<any> = {}) => {
  return {
    borderRadius: 5,
    backgroundColor: ColorMap.dark2,
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 4,
    height: 64,
    position: 'relative',
    ...style,
  };
};

const inputLabelStyle: StyleProp<any> = {
  paddingTop: 2,
  ...sharedStyles.smallText,
  ...FontSize0,
  ...FontMedium,
  color: ColorMap.disabled,
};

const identiconPlaceholderStyle: StyleProp<any> = {
  backgroundColor: ColorMap.disabled,
  borderRadius: 16,
  width: 16,
  height: 16,
};

const getTextInputStyle = (isAddressValid: boolean) => {
  return {
    ...FontSize2,
    flex: 1,
    paddingTop: 0,
    paddingBottom: 0,
    paddingHorizontal: 4,
    paddingRight: 40,
    height: 25,
    ...FontMedium,
    color: isAddressValid ? ColorMap.light : ColorMap.danger,
  };
};

const getFormattedTextInputStyle = (isAddressValid: boolean) => {
  return {
    ...sharedStyles.mainText,
    flex: 1,
    paddingHorizontal: 4,
    ...FontMedium,
    height: 25,
    color: isAddressValid ? ColorMap.light : ColorMap.danger,
  };
};

const qrButtonStyle: StyleProp<any> = {
  position: 'absolute',
  right: 6,
  bottom: 2,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

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
    disable,
    label,
    onChange,
    onPressQrButton,
    value,
    isValidValue = true,
    showAvatar = true,
  } = inputAddressProps;
  const [isInputBlur, setInputBlur] = useState<boolean>(true);
  const [address, setAddress] = useState<string>(value);
  const isAddressValid = isValidCurrentAddress(address, isEthereumAddress(address)) && isValidValue;
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
    <View style={getInputContainerStyle(containerStyle)}>
      <TouchableOpacity activeOpacity={1} onPress={onPressContainer} disabled={disable}>
        <Text style={inputLabelStyle}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 2 }}>
          {showAvatar && (
            <>
              {isAddressValid ? (
                <SubWalletAvatar address={address || ''} size={24} style={{ borderColor: 'transparent' }} />
              ) : (
                <View style={identiconPlaceholderStyle} />
              )}
            </>
          )}
          {!isInputBlur ? (
            <TextInput
              autoCorrect={false}
              autoFocus={true}
              style={getTextInputStyle(isAddressValid)}
              placeholderTextColor={ColorMap.disabled}
              selectionColor={ColorMap.disabled}
              blurOnSubmit={false}
              value={address}
              onBlur={onInputBlur}
              onChangeText={onChangeInputText}
              editable={!disable}
            />
          ) : (
            <Text style={getFormattedTextInputStyle(isAddressValid)}>{toShort(address, 9, 9)}</Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        style={qrButtonStyle}
        onPress={onPressQrButton}
        disabled={disable}>
        <QrCode color={ColorMap.disabled} weight={'bold'} size={20} />
      </TouchableOpacity>
    </View>
  );
};

export const InputAddress = forwardRef(Component);
