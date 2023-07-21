import Input, { InputProps } from 'components/design-system-ui/input';
import React, { ForwardedRef, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { TextInput } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Button, Icon } from 'components/design-system-ui';
import { Scan } from 'phosphor-react-native';
import { NativeSyntheticEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import { TextInputFocusEventData } from 'react-native/Libraries/Components/TextInput/TextInput';
import { AddressScanner, AddressScannerProps } from 'components/Scanner/AddressScanner';
import { requestCameraPermission } from 'utils/permission/camera';
import { RESULTS } from 'react-native-permissions';
import { setAdjustResize } from 'rn-android-keyboard-adjust';

interface Props extends InputProps {
  isValidValue?: boolean;
  showAvatar?: boolean;
  scannerProps?: Omit<AddressScannerProps, 'onChangeAddress' | 'onPressCancel' | 'qrModalVisible'>;
}

const Component = (
  { isValidValue, scannerProps = {}, value = '', ...inputProps }: Props,
  ref: ForwardedRef<TextInput>,
) => {
  const theme = useSubWalletTheme().swThemes;
  const [isShowQrModalVisible, setIsShowQrModalVisible] = useState<boolean>(false);
  const isAddressValid = isValidValue !== undefined ? isValidValue : true;
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => setAdjustResize(), []);

  const onPressQrButton = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setIsShowQrModalVisible(true);
    }
  }, []);

  const RightPart = useMemo(() => {
    return (
      <>
        <Button
          style={{ marginRight: theme.marginXXS }}
          disabled={inputProps.disabled || inputProps.readonly}
          size={'xs'}
          type={'ghost'}
          onPress={onPressQrButton}
          icon={
            <Icon
              phosphorIcon={Scan}
              size={'sm'}
              iconColor={inputProps.readonly ? theme.colorTextLight5 : theme.colorTextLight3}
            />
          }
        />
      </>
    );
  }, [
    inputProps.disabled,
    inputProps.readonly,
    onPressQrButton,
    theme.colorTextLight3,
    theme.colorTextLight5,
    theme.marginXXS,
  ]);

  const onChangeInputText = useCallback(
    (rawText: string) => {
      const text = rawText.trim();

      if (inputProps.onChangeText) {
        inputProps.onChangeText(text);
      }
    },
    [inputProps],
  );

  const onScanInputText = useCallback(
    (data: string) => {
      setError(undefined);
      setIsShowQrModalVisible(false);
      onChangeInputText(data);
    },
    [onChangeInputText],
  );

  const onInputFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    inputProps.onFocus && inputProps.onFocus(e);
  };

  const onInputBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    inputProps.onBlur && inputProps.onBlur(e);
  };

  const closeAddressScanner = useCallback(() => {
    setError(undefined);
    setIsShowQrModalVisible(false);
  }, []);

  return (
    <>
      <Input
        ref={ref}
        {...inputProps}
        rightPart={RightPart}
        isError={!isAddressValid}
        onChangeText={onChangeInputText}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        value={value}
        inputStyle={{ paddingRight: 44 }}
      />

      <AddressScanner
        {...scannerProps}
        qrModalVisible={isShowQrModalVisible}
        onPressCancel={closeAddressScanner}
        onChangeAddress={onScanInputText}
        isShowError
        error={error}
      />
    </>
  );
};

export const InputConnectUrl = forwardRef(Component);
