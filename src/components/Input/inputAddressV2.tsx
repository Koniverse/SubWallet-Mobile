import Input, { InputProps } from 'components/design-system-ui/input';
import React, { ForwardedRef, forwardRef, useCallback, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { isAddress } from '@polkadot/util-crypto';
import { Avatar, Button, Icon, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import { Book, Scan } from 'phosphor-react-native';
import { AddressBookModal } from 'components/Modal/AddressBook/AddressBookModal';
import { NativeSyntheticEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import { TextInputFocusEventData } from 'react-native/Libraries/Components/TextInput/TextInput';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import { saveRecentAccount } from 'messaging/index';
import { requestCameraPermission } from 'utils/permission/camera';
import { RESULTS } from 'react-native-permissions';
import createStylesheet from './style/inputAddress';

interface Props extends InputProps {
  isValidValue?: boolean;
  showAvatar?: boolean;
  showAddressBook?: boolean;
  networkGenesisHash?: string;
  addressPrefix?: number;
  scanMessage?: string;
  saveAddress?: boolean;
}

const Component = (
  {
    isValidValue,
    showAvatar = true,
    showAddressBook,
    networkGenesisHash,
    addressPrefix,
    scanMessage,
    saveAddress = true,
    ...inputProps
  }: Props,
  ref: ForwardedRef<TextInput>,
) => {
  const theme = useSubWalletTheme().swThemes;
  const [isInputBlur, setInputBlur] = useState<boolean>(true);
  const [address, setAddress] = useState<string>(inputProps.value || '');
  const [isShowAddressBookModal, setShowAddressBookModal] = useState<boolean>(false);
  const [isShowQrModalVisible, setIsShowQrModalVisible] = useState<boolean>(false);
  const isAddressValid = isAddress(address) && (isValidValue !== undefined ? isValidValue : true);

  const hasLabel = !!inputProps.label;
  const isInputVisible = !isAddressValid || !address || !isInputBlur;
  const stylesheet = createStylesheet(
    theme,
    isInputVisible,
    isAddressValid,
    hasLabel,
    inputProps.readonly,
    showAvatar,
    showAddressBook,
  );

  const LeftPart = useMemo(() => {
    return (
      <>
        {showAvatar && (
          <View style={stylesheet.avatarWrapper}>
            <Avatar value={address || ''} size={hasLabel ? 20 : 24} />
          </View>
        )}
        <Typography.Text style={stylesheet.addressText}>{toShort(address, 9, 9)}</Typography.Text>
      </>
    );
  }, [address, hasLabel, showAvatar, stylesheet.addressText, stylesheet.avatarWrapper]);

  const onPressQrButton = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setIsShowQrModalVisible(true);
    }
  }, []);

  const RightPart = useMemo(() => {
    return (
      <>
        {showAddressBook && (
          <Button
            disabled={inputProps.disabled || inputProps.readonly}
            size={'xs'}
            type={'ghost'}
            onPress={() => setShowAddressBookModal(true)}
            icon={
              <Icon
                phosphorIcon={Book}
                size={'sm'}
                iconColor={inputProps.readonly ? theme.colorTextLight5 : theme.colorTextLight3}
              />
            }
          />
        )}
        <Button
          style={stylesheet.scanButton}
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
    showAddressBook,
    stylesheet.scanButton,
    theme.colorTextLight3,
    theme.colorTextLight5,
  ]);

  const onChangeInputText = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      setAddress(text);

      if (inputProps.onChangeText) {
        inputProps.onChangeText(text);

        if (saveAddress && isAddress(text)) {
          saveRecentAccount(text).catch(console.error);
        }
      }
    },
    [inputProps, saveAddress],
  );

  const onInputFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setInputBlur(false);
    inputProps.onFocus && inputProps.onFocus(e);
  };

  const onInputBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setInputBlur(true);
    inputProps.onBlur && inputProps.onBlur(e);
  };

  const onSelectAddressBook = useCallback(
    (_value: string) => {
      onChangeInputText(_value);
    },
    [onChangeInputText],
  );

  const closeAddressScanner = useCallback(() => {
    setIsShowQrModalVisible(false);
  }, []);

  const closeAddressBookModal = useCallback(() => {
    setShowAddressBookModal(false);
  }, []);

  return (
    <>
      <Input
        ref={ref}
        {...inputProps}
        leftPart={LeftPart}
        rightPart={RightPart}
        isError={!isAddressValid}
        onChangeText={onChangeInputText}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        inputStyle={stylesheet.inputStyle}
      />

      <AddressScanner
        qrModalVisible={isShowQrModalVisible}
        onPressCancel={closeAddressScanner}
        onChangeAddress={onChangeInputText}
        scanMessage={scanMessage}
      />

      {showAddressBook && (
        <AddressBookModal
          addressPrefix={addressPrefix}
          modalVisible={isShowAddressBookModal}
          networkGenesisHash={networkGenesisHash}
          onSelect={onSelectAddressBook}
          value={inputProps.value}
          onClose={closeAddressBookModal}
        />
      )}
    </>
  );
};

export const InputAddress = forwardRef(Component);
