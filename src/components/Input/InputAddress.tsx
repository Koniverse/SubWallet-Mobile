import { InputProps } from 'components/design-system-ui/input';
import React, { ForwardedRef, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, TextInput, View } from 'react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Button, Icon, Input, Typography } from 'components/design-system-ui';
import { toShort } from 'utils/index';
import { Book, Scan } from 'phosphor-react-native';
import { AddressBookModal } from 'components/Modal/AddressBook/AddressBookModal';
import { NativeSyntheticEvent } from 'react-native/Libraries/Types/CoreEventTypes';
import { TextInputFocusEventData } from 'react-native/Libraries/Components/TextInput/TextInput';
import { AddressScanner, AddressScannerProps } from 'components/Scanner/AddressScanner';
import { CHAINS_SUPPORTED_DOMAIN, isAzeroDomain } from '@subwallet/extension-base/koni/api/dotsama/domain';
import { saveRecentAccount, resolveAddressToDomain, resolveDomainToAddress } from 'messaging/index';
import createStylesheet from './style/InputAddress';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { findContactByAddress } from 'utils/account';
import i18n from 'utils/i18n/i18n';
import { setAdjustResize } from 'rn-android-keyboard-adjust';
import useCheckCamera from 'hooks/common/useCheckCamera';
import { isAddress } from '@subwallet/keyring';
import { _reformatAddressWithChain, reformatAddress } from '@subwallet/extension-base/utils';
import HorizontalInput from 'components/design-system-ui/input/HorizontalInput';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { deviceWidth } from 'constants/index';
import useFetchChainInfo from 'hooks/common/useFetchChainInfo';
import useIsPolkadotUnifiedChain from 'hooks/common/useIsPolkadotUnifiedChain';

interface Props extends InputProps {
  chain?: string;
  reValidate?: () => void;
  isValidValue?: boolean;
  showAvatar?: boolean;
  showAddressBook?: boolean;
  saveAddress?: boolean;
  scannerProps?: Omit<
    AddressScannerProps,
    'onChangeAddress' | 'onPressCancel' | 'qrModalVisible' | 'setQrModalVisible'
  >;
  onSideEffectChange?: () => void; // callback for address book or scan QR
  fitNetwork?: boolean;
  horizontal?: boolean;
}

const addressLength = 9;

const Component = (
  {
    chain,
    isValidValue,
    showAvatar = true,
    showAddressBook,
    scannerProps = {},
    saveAddress = true,
    value = '',
    reValidate,
    onSideEffectChange,
    fitNetwork,
    horizontal,
    ...inputProps
  }: Props,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref: ForwardedRef<TextInput>,
) => {
  const theme = useSubWalletTheme().swThemes;
  const [domainName, setDomainName] = useState<string | undefined>(undefined);
  const [isInputBlur, setInputBlur] = useState<boolean>(true);
  const [isShowAddressBookModal, setShowAddressBookModal] = useState<boolean>(false);
  const [isShowQrModalVisible, setIsShowQrModalVisible] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string | undefined>(value);
  const isAddressValid = isValidValue !== undefined ? isValidValue : true;
  const { accounts, contacts } = useSelector((root: RootState) => root.accountState);
  const [error, setError] = useState<string | undefined>(undefined);
  const inputRef = useRef<TextInput | null>(null);
  const checkCamera = useCheckCamera();
  const chainInfo = useFetchChainInfo(chain || '');
  const hasLabel = !!inputProps.label;
  const isInputVisible = !isAddressValid || !value || !isInputBlur;
  const checkIsPolkadotUnifiedChain = useIsPolkadotUnifiedChain();
  const chainOldPrefixMap = useSelector((state: RootState) => state.chainStore.chainOldPrefixMap);
  const stylesheet = createStylesheet(
    theme,
    isInputVisible,
    isAddressValid,
    hasLabel,
    inputProps.readonly,
    showAvatar,
    showAddressBook,
    horizontal,
  );

  useEffect(() => setAdjustResize(), []);

  const isOldSubstrateAddress = useCallback(
    (address: string) => {
      const isValidAddress = isAddress(address);
      if (!(chain && checkIsPolkadotUnifiedChain(chain) && isValidAddress)) {
        return false;
      }

      const oldPrefix = chainOldPrefixMap[chain];

      return reformatAddress(address, oldPrefix) === address;
    },
    [chain, chainOldPrefixMap, checkIsPolkadotUnifiedChain],
  );

  const onChangeInputText = useCallback(
    (rawText: string) => {
      console.log('run to 1');
      setSelectedOption(undefined);
      const text = rawText.trim();

      if (inputProps.onChangeText) {
        inputProps.onChangeText(text);

        if (saveAddress && isAddress(text)) {
          saveRecentAccount(text, chain).catch(console.error);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chain, saveAddress],
  );

  useEffect(() => {
    if (chain && value && CHAINS_SUPPORTED_DOMAIN.includes(chain)) {
      if (isAzeroDomain(value)) {
        resolveDomainToAddress({
          chain,
          domain: value,
        })
          .then(result => {
            if (result) {
              setDomainName(value);
              onChangeInputText(result);
              if (inputRef.current) {
                if (!inputRef.current.isFocused() && reValidate) {
                  reValidate();
                } else {
                  inputRef.current.blur();
                }
              }
            }
          })
          .catch(console.error);
      } else if (isAddress(value)) {
        resolveAddressToDomain({
          chain,
          address: value,
        })
          .then(result => {
            if (result) {
              setDomainName(result);
            }
          })
          .catch(console.error);
      }
    } else {
      setDomainName(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, onChangeInputText, value]);

  const _contacts = useMemo(() => [...accounts, ...contacts], [accounts, contacts]);

  const accountName = useMemo(() => {
    const _value = selectedOption || '';
    if (isOldSubstrateAddress(_value)) {
      return toShort(_value, 3, 4);
    }
    const account = findContactByAddress(_contacts, _value);

    return account?.name;
  }, [_contacts, isOldSubstrateAddress, selectedOption]);

  const formattedAddress = useMemo((): string => {
    const _value = value || '';

    if (!chainInfo) {
      return _value;
    }

    if (!isAddress(_value)) {
      return _value;
    }

    return _reformatAddressWithChain(_value, chainInfo);
  }, [chainInfo, value]);

  const LeftPart = useMemo(() => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: horizontal ? 0 : showAvatar ? 0 : 8,
          flexShrink: 1,
          maxWidth: deviceWidth - 168,
          overflow: 'hidden',
        }}>
        {showAvatar && (
          <View style={stylesheet.avatarWrapper}>
            <AccountProxyAvatar value={value || ''} size={hasLabel ? 20 : 24} />
          </View>
        )}
        <Typography.Text ellipsis style={stylesheet.addressText}>
          {accountName || domainName || toShort(value, addressLength, addressLength)}
        </Typography.Text>
        {(fitNetwork ? accountName || domainName : accountName || domainName) && (
          <Typography.Text style={stylesheet.addressAliasText}>({toShort(formattedAddress, 4, 4)})</Typography.Text>
        )}
      </View>
    );
  }, [
    accountName,
    domainName,
    fitNetwork,
    formattedAddress,
    hasLabel,
    horizontal,
    showAvatar,
    stylesheet.addressAliasText,
    stylesheet.addressText,
    stylesheet.avatarWrapper,
    value,
  ]);

  const onPressQrButton = useCallback(async () => {
    // use setTimeout for smooth animation of keyboard and scanner screen
    const openScannerScreen = () => {
      setTimeout(() => setIsShowQrModalVisible(true), 500);
    };

    Keyboard.dismiss();
    checkCamera(undefined, openScannerScreen)();
  }, [checkCamera]);

  const RightPart = useMemo(() => {
    return (
      <View style={{ flexDirection: 'row' }}>
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
      </View>
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

  const onScanInputText = useCallback(
    (data: string) => {
      if (isAddress(data)) {
        setError(undefined);
        setIsShowQrModalVisible(false);
        onChangeInputText(data);
        inputRef.current?.focus();
        inputRef.current?.blur();
        onSideEffectChange?.();
      } else {
        setError(i18n.errorMessage.isNotAnAddress);
      }
    },
    [onChangeInputText, onSideEffectChange],
  );

  const onInputFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setInputBlur(false);
    inputProps.onFocus && inputProps.onFocus(e);
  };

  const onInputBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setInputBlur(true);
      const isValidAddress = isAddress(value);
      const shouldReformatAddress = isOldSubstrateAddress(value) && isValidAddress && chainInfo && !selectedOption;

      if (shouldReformatAddress) {
        const reformattedInputValue = _reformatAddressWithChain(value, chainInfo);

        if (value !== reformattedInputValue && inputProps.onChangeText) {
          console.log('run to 2');
          setSelectedOption(value);

          inputProps.onChangeText(reformattedInputValue);
        }
      }
      inputProps.onBlur && inputProps.onBlur(e);
    },
    [chainInfo, inputProps, isOldSubstrateAddress, selectedOption, value],
  );

  const onSelectAddressBook = useCallback(
    (_value: string) => {
      onChangeInputText(_value);
      console.log('run to 3');
      setSelectedOption(_value);
      onSideEffectChange?.();
    },
    [onChangeInputText, onSideEffectChange],
  );

  const closeAddressScanner = useCallback(() => {
    setError(undefined);
    setIsShowQrModalVisible(false);
  }, []);

  return (
    <>
      {horizontal ? (
        <HorizontalInput
          ref={myRef => {
            inputRef.current = myRef;
            // @ts-ignored
            ref = inputRef.current;
          }}
          {...inputProps}
          leftPart={LeftPart}
          leftPartStyle={stylesheet.inputLeftPart}
          rightPart={RightPart}
          isError={!isAddressValid}
          onChangeText={onChangeInputText}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          inputStyle={stylesheet.input}
          value={value}
          labelStyle={{ width: 48 }}
        />
      ) : (
        <Input
          ref={myRef => {
            inputRef.current = myRef;
            // @ts-ignored
            ref = inputRef.current;
          }}
          {...inputProps}
          leftPart={LeftPart}
          leftPartStyle={stylesheet.inputLeftPart}
          rightPart={RightPart}
          isError={!isAddressValid}
          onChangeText={onChangeInputText}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
          inputStyle={stylesheet.input}
          value={value}
        />
      )}

      <AddressScanner
        {...scannerProps}
        qrModalVisible={isShowQrModalVisible}
        onPressCancel={closeAddressScanner}
        onChangeAddress={onScanInputText}
        isShowError
        error={error}
        setQrModalVisible={setIsShowQrModalVisible}
      />

      {showAddressBook && (
        <AddressBookModal
          modalVisible={isShowAddressBookModal}
          chainSlug={chain}
          onSelect={onSelectAddressBook}
          value={value}
          setVisible={setShowAddressBookModal}
        />
      )}
    </>
  );
};

export const InputAddress = forwardRef(Component);
