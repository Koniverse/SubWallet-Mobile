import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { InputAddress } from 'components/Input/InputAddress';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import useGetDefaultAccountName from 'hooks/useGetDefaultAccountName';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Eye, X } from 'phosphor-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { Keyboard, ScrollView, View } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import { RootNavigationProps } from 'routes/index';
import { QrAccount } from 'types/qr/attach';
import { backToHome } from 'utils/navigation';
import { readOnlyScan } from 'utils/scanner/attach';
import { requestCameraPermission } from 'utils/permission/camera';
import { createAccountExternalV2 } from 'messaging/index';
import { sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
import createStyle from './styles';

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
  const [isBusy, setIsBusy] = useState<boolean>(false);

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
    backToHome(goHome, true);
  }, [goHome]);

  const onOpenScanner = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setIsScanning(true);
    }
  }, []);

  const onCloseScanner = useCallback(() => {
    setIsScanning(false);
  }, []);

  const handleCreateAccount = useCallback(
    (name: string): void => {
      setIsBusy(true);

      if (!account) {
        setIsBusy(false);
        return;
      }

      if (account.isAddress) {
        createAccountExternalV2({
          name: name,
          address: account.content,
          genesisHash: account.genesisHash,
          isEthereum: account.isEthereum,
          isAllowed: false,
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
    },
    [account, onComplete],
  );

  const onSubmitForm = useCallback(
    (formState: FormState) => {
      if (formState.data.address) {
        handleCreateAccount(defaultName);
      } else {
        Keyboard.dismiss();
      }
    },
    [defaultName, handleCreateAccount],
  );

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: onSubmitForm,
  });

  const handleSubmit = useCallback(() => {
    onSubmitForm(formState);
  }, [formState, onSubmitForm]);

  const onChangeAddress = useCallback(
    (receiverAddress: string | null, currentTextValue: string) => {
      const qrAccount = readOnlyScan(currentTextValue);

      if (!qrAccount) {
        setErrors([i18n.errorMessage.invalidAddress]);
        onChangeValue('address')('');
        return;
      }

      setErrors([]);
      setAccount(qrAccount);
      onChangeValue('address')(qrAccount.content);
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

      if (!qrAccount) {
        setErrors([i18n.warningMessage.invalidQRCode]);
        update('');
        return;
      }

      setErrors([]);
      setAccount(qrAccount);
      update(qrAccount.content);
    },
    [formState.refs.address],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={i18n.title.readonlyAccount}
      disabled={isBusy}
      rightIcon={X}
      onPressRightIcon={goHome}>
      <View style={styles.wrapper}>
        <ScrollView style={styles.container}>
          <Typography.Text style={styles.title}>
            Track the activity of any wallet without injecting your private key to SubWallet
          </Typography.Text>
          <View style={styles.pageIconContainer}>
            <PageIcon icon={Eye} color={theme.colorSuccess} />
          </View>
          <InputAddress
            value={formState.data.address}
            ref={formState.refs.address}
            label={formState.labels.address}
            isValidValue={formState.isValidated.address}
            onSubmitField={onSubmitField('address')}
            onChange={onChangeAddress}
            onPressQrButton={onOpenScanner}
            containerStyle={sharedStyles.mb8}
            showAvatar={true}
            disable={isBusy}
          />
          {errors.length > 0 &&
            errors.map((message, index) => <Warning isDanger message={message} key={index} style={styles.warning} />)}
          <AddressScanner qrModalVisible={isScanning} onPressCancel={onCloseScanner} onChangeAddress={onScan} />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            icon={<Icon phosphorIcon={Eye} weight="fill" />}
            loading={isBusy}
            onPress={handleSubmit}
            disabled={errors.length > 0 || !formState.data.address}>
            {i18n.title.attachReadonlyAccount}
          </Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(AttachReadOnly);
