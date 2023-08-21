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
import { addConnection } from 'messaging/index';
import i18n from 'utils/i18n/i18n';
import { validWalletConnectUri } from 'utils/scanner/walletConnect';
import { useToast } from 'react-native-toast-notifications';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

interface Props extends InputProps {
  isValidValue?: boolean;
  showAvatar?: boolean;
  scannerProps?: Omit<AddressScannerProps, 'onChangeAddress' | 'onPressCancel' | 'qrModalVisible'>;
  isShowQrModalVisible: boolean;
  setQrModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Component = (
  {
    isValidValue,
    scannerProps = {},
    value = '',
    isShowQrModalVisible,
    setQrModalVisible,
    setLoading,
    ...inputProps
  }: Props,
  ref: ForwardedRef<TextInput>,
) => {
  const theme = useSubWalletTheme().swThemes;
  const isAddressValid = isValidValue !== undefined ? isValidValue : true;
  const [error, setError] = useState<string | undefined>(undefined);
  const navigation = useNavigation<RootNavigationProps>();
  const toast = useToast();

  useEffect(() => setAdjustResize(), []);

  const onPressQrButton = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setQrModalVisible(true);
    }
  }, [setQrModalVisible]);

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
      setQrModalVisible(false);
      onChangeInputText(data);
      setLoading(true);
      if (!validWalletConnectUri(data)) {
        addConnection({ uri: data })
          .then(() => {
            setLoading(false);
            navigation.goBack();
          })
          .catch(e => {
            const errMessage = (e as Error).message;
            const message = errMessage.includes('Pairing already exists')
              ? i18n.errorMessage.connectionAlreadyExist
              : i18n.errorMessage.failToAddConnection;

            toast.hideAll();
            toast.show(message, { type: 'danger' });
            setLoading(false);
          });
      }
    },
    [navigation, onChangeInputText, setLoading, setQrModalVisible, toast],
  );

  const onInputFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    inputProps.onFocus && inputProps.onFocus(e);
  };

  const onInputBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    inputProps.onBlur && inputProps.onBlur(e);
  };

  const closeAddressScanner = useCallback(() => {
    setError(undefined);
    setQrModalVisible(false);
  }, [setQrModalVisible]);

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
