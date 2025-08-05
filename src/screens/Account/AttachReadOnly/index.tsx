import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { InputAddress } from 'components/Input/InputAddress';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Eye, X } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { readOnlyScan } from 'utils/scanner/attach';
import { createAccountExternalV2 } from 'messaging/index';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { Button, PageIcon, Typography } from 'components/design-system-ui';
import createStyle from './styles';
import { getButtonIcon } from 'utils/button';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AccountExternalErrorCode } from '@subwallet/extension-base/background/KoniTypes';
import InputText from 'components/Input/InputText';
import { isSameAddress } from '@subwallet/extension-base/utils';
import { isAddress } from '@subwallet/keyring/utils/address';

const AttachReadOnly = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();

  const styles = useMemo(() => createStyle(theme), [theme]);
  const [reformatAddress, setReformatAddress] = useState('');
  const [isHideAccountNameInput, setIsHideAccountNameInput] = useState(false);
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const { onPress: onPressSubmit } = useUnlockModal(navigation);

  const accountAddressValidator = useCallback(
    (value: string) => {
      if (!isAddress(value)) {
        return ['Invalid address'];
      }

      const result = readOnlyScan(value);

      if (result) {
        for (const _account of accounts) {
          if (isSameAddress(_account.address, result.content)) {
            setReformatAddress('');
            setIsHideAccountNameInput(true);
            return ['Account already exists'];
          }
        }
      } else {
        setReformatAddress('');
        setIsHideAccountNameInput(true);

        if (value !== '') {
          return ['Invalid address'];
        }
      }

      setIsHideAccountNameInput(false);
      return [];
    },
    [accounts],
  );

  const formConfig = useMemo((): FormControlConfig => {
    return {
      address: {
        name: i18n.common.accountAddress,
        value: '',
        require: true,
        validateFunc: accountAddressValidator,
      },
      name: {
        name: 'Account name',
        value: '',
        require: true,
      },
    };
  }, [accountAddressValidator]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onComplete = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation]);

  const onCloseScanner = useCallback(() => {
    setScanError(undefined);
    setIsScanning(false);
  }, []);

  const _onSubmitForm = (): void => {
    setIsBusy(true);
    const accountName = formState.data.name.trim();
    if (reformatAddress && accountName) {
      createAccountExternalV2({
        name: accountName,
        address: reformatAddress,
        genesisHash: '',
        isAllowed: true,
        isReadOnly: true,
      })
        .then(errs => {
          if (errs.length) {
            const errorNameInputs: string[] = [];
            const errorAddressInputs: string[] = [];

            errs.forEach(error => {
              if (error.code === AccountExternalErrorCode.INVALID_ADDRESS) {
                errorAddressInputs.push(error.message);
              } else if (error.message.toLowerCase().includes('account name already exists')) {
                errorNameInputs.push(error.message);
              } else {
                errorAddressInputs.push('Invalid address');
              }
            });

            onUpdateErrors('address')(errorAddressInputs);
            onUpdateErrors('name')(errorNameInputs);
          } else {
            onComplete();
          }
        })
        .catch((error: Error) => {
          onUpdateErrors('name')([error.message]);
          console.error(error);
        })
        .finally(() => {
          setIsBusy(false);
        });
    } else {
      Keyboard.dismiss();
    }
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onPressSubmit(_onSubmitForm),
  });

  const onChangeAddress = useCallback(
    (currentTextValue: string) => {
      onChangeValue('address')(currentTextValue);

      if (!isAddress(currentTextValue)) {
        return;
      }

      const qrAccount = readOnlyScan(currentTextValue);

      if (qrAccount) {
        setReformatAddress(qrAccount.content);
        return;
      }
    },
    [onChangeValue],
  );

  const onScan = useCallback(
    (text: string) => {
      const qrAccount = readOnlyScan(text);
      const update = (s: string) => {
        if (formState.refs.address && formState.refs.address.current) {
          // @ts-ignore
          formState.refs.address.current.onChange(s);
        }
      };

      if (isAddress(text)) {
        if (!qrAccount) {
          onUpdateErrors('address')([i18n.warningMessage.invalidQRCode]);
          update('');
          return;
        }

        onUpdateErrors('address')([]);
        setScanError(undefined);
        setIsScanning(false);
        setReformatAddress(qrAccount.content);
        update(qrAccount.content);
      } else {
        setScanError(i18n.errorMessage.isNotAnAddress);
        return;
      }
    },
    [formState.refs.address, onUpdateErrors],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.header.attachReadOnlyAcc}
      disabled={isBusy}
      rightIcon={X}
      onPressRightIcon={goHome}>
      <View style={styles.wrapper}>
        <ScrollView style={styles.container} keyboardShouldPersistTaps={'handled'}>
          <Typography.Text style={styles.title}>{i18n.attachAccount.attachWatchOnlyAccMessage}</Typography.Text>
          <View style={styles.pageIconContainer}>
            <PageIcon icon={Eye} color={theme.colorSuccess} />
          </View>
          <InputAddress
            saveAddress={false}
            ref={formState.refs.address}
            containerStyle={{ marginBottom: theme.sizeSM }}
            label={formState.labels.address}
            value={formState.data.address}
            onChangeText={onChangeAddress}
            isValidValue={formState.isValidated.address}
            placeholder={i18n.placeholder.accountAddress}
            disabled={isBusy}
            onSubmitEditing={formState.errors.address.length > 0 ? () => Keyboard.dismiss() : onSubmitField('address')}
          />
          {formState.errors.address.length > 0 &&
            formState.errors.address.map((message, index) => (
              <Warning isDanger message={message} key={index} style={styles.warning} />
            ))}
          {!isHideAccountNameInput && (
            <InputText
              ref={formState.refs.name}
              label={'Account name'}
              placeholder={'Enter the account name'}
              onChangeText={onChangeValue('name')}
              value={formState.data.name}
              errorMessages={formState.errors.name}
              disabled={isBusy}
            />
          )}
          <AddressScanner
            qrModalVisible={isScanning}
            onPressCancel={onCloseScanner}
            onChangeAddress={onScan}
            isShowError
            error={scanError}
            setQrModalVisible={setIsScanning}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            icon={getButtonIcon(Eye)}
            loading={isBusy}
            onPress={onPressSubmit(_onSubmitForm)}
            disabled={formState.errors.address.length > 0 || !formState.data.address || !formState.data.name || isBusy}>
            {i18n.buttonTitles.attachWatchOnlyAcc}
          </Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(AttachReadOnly);
