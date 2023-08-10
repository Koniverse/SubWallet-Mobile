import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { InputAddress } from 'components/Input/InputAddressV2';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import useGetDefaultAccountName from 'hooks/useGetDefaultAccountName';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Eye, X } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { QrAccount } from 'types/qr/attach';
import { backToHome } from 'utils/navigation';
import { readOnlyScan } from 'utils/scanner/attach';
import { createAccountExternalV2 } from 'messaging/index';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { Button, PageIcon, Typography } from 'components/design-system-ui';
import createStyle from './styles';
import { getButtonIcon } from 'utils/button';
import { isAddress } from '@polkadot/util-crypto';

const validateAddress = (value: string) => {
  const qrAccount = readOnlyScan(value);
  if (!qrAccount) {
    return [i18n.warningMessage.invalidQRCode];
  } else {
    return [];
  }
};

const AttachReadOnly = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const defaultName = useGetDefaultAccountName();

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [account, setAccount] = useState<QrAccount | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [scanError, setScanError] = useState<string | undefined>(undefined);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const { onPress: onPressSubmit } = useUnlockModal(navigation);
  const accountRef = useRef<QrAccount | null>(null);

  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  const formConfig = useMemo((): FormControlConfig => {
    return {
      address: {
        name: i18n.common.accountAddress,
        value: '',
        require: true,
        validateFunc: validateAddress,
      },
    };
  }, []);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onComplete = useCallback(() => {
    backToHome(goHome);
  }, [goHome]);

  const onCloseScanner = useCallback(() => {
    setScanError(undefined);
    setIsScanning(false);
  }, []);

  const _onSubmitForm = (): void => {
    setIsBusy(true);
    const _account = accountRef.current;
    if (formState.data.address) {
      if (!_account) {
        setIsBusy(false);
        return;
      }
      if (_account.isAddress) {
        createAccountExternalV2({
          name: defaultName,
          address: _account.content,
          genesisHash: _account.genesisHash,
          isEthereum: _account.isEthereum,
          isAllowed: true,
          isReadOnly: true,
        })
          .then(errs => {
            if (errs.length) {
              setErrors(errs.map(e => e.message));
            } else {
              onComplete();
            }
          })
          .catch((error: Error) => {
            setErrors([error.message]);
            console.error(error);
          })
          .finally(() => {
            setIsBusy(false);
          });
      } else {
        setIsBusy(false);
      }
    } else {
      Keyboard.dismiss();
    }
  };

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: onPressSubmit(_onSubmitForm),
  });

  const onChangeAddress = useCallback(
    (currentTextValue: string) => {
      setErrors([]);
      onChangeValue('address')(currentTextValue);
      if (!currentTextValue) {
        setErrors([i18n.warningMessage.requireMessage]);
        return;
      }

      const qrAccount = readOnlyScan(currentTextValue);

      if (!qrAccount) {
        setErrors([i18n.errorMessage.invalidAddress]);
        return;
      }

      setAccount(qrAccount);
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
          setErrors([i18n.warningMessage.invalidQRCode]);
          update('');
          return;
        }

        setErrors([]);
        setScanError(undefined);
        setIsScanning(false);
        setAccount(qrAccount);
        update(qrAccount.content);
      } else {
        setScanError(i18n.errorMessage.isNotAnAddress);
        return;
      }
    },
    [formState.refs.address],
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
            ref={formState.refs.address}
            containerStyle={{ marginBottom: theme.sizeSM }}
            label={formState.labels.address}
            value={formState.data.address}
            onChangeText={onChangeAddress}
            isValidValue={formState.isValidated.address}
            placeholder={i18n.placeholder.accountAddress}
            disabled={isBusy}
            onSubmitEditing={errors.length > 0 ? () => Keyboard.dismiss() : onSubmitField('address')}
          />
          {errors.length > 0 &&
            errors.map((message, index) => <Warning isDanger message={message} key={index} style={styles.warning} />)}
          <AddressScanner
            qrModalVisible={isScanning}
            onPressCancel={onCloseScanner}
            onChangeAddress={onScan}
            isShowError
            error={scanError}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            icon={getButtonIcon(Eye)}
            loading={isBusy}
            onPress={onPressSubmit(_onSubmitForm)}
            disabled={errors.length > 0 || !formState.data.address || isBusy}>
            {i18n.buttonTitles.attachWatchOnlyAcc}
          </Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(AttachReadOnly);
