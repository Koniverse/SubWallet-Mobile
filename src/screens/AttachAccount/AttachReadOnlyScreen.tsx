import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { InputAddress } from 'components/Input/InputAddress';
import { AddressScanner } from 'components/Scanner/AddressScanner';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { RESULTS } from 'react-native-permissions';
import { useSelector } from 'react-redux';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { QrAccount } from 'types/qr/attach';
import { backToHome } from 'utils/navigation';
import { readOnlyScan } from 'utils/scanner/attach';
import { requestCameraPermission } from 'utils/permission/camera';
import { createAccountExternalV2 } from 'messaging/index';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { Button } from 'components/design-system-ui';

const WrapperStyle: StyleProp<ViewStyle> = {
  flex: 1,
  ...ContainerHorizontalPadding,
  paddingTop: 16,
};

const ScrollViewStyle: StyleProp<ViewStyle> = {
  flex: 1,
  marginBottom: 16,
};

const WarningStyle: StyleProp<ViewStyle> = {
  marginBottom: 8,
};

const ActionAreaStyle: StyleProp<ViewStyle> = {
  ...MarginBottomForSubmitButton,
  flexDirection: 'row',
};

const ButtonStyle: StyleProp<ViewStyle> = {
  flex: 1,
};

const validateAddress = (value: string) => {
  const qrAccount = readOnlyScan(value);
  if (!qrAccount) {
    return [i18n.warningMessage.invalidQRCode];
  } else {
    return [];
  }
};

function checkValidateForm(formValidated: Record<string, boolean>) {
  return formValidated.accountName && formValidated.address;
}

const AttachReadOnlyScreen = () => {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);

  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();

  const defaultName = useMemo(
    (): string => `Account ${accounts.filter(acc => acc.address !== 'ALL').length + 1}`,
    [accounts],
  );

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
      accountName: {
        name: i18n.common.walletName,
        value: '',
        require: true,
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
      if (checkValidateForm(formState.isValidated)) {
        handleCreateAccount(formState.data.accountName);
      } else {
        Keyboard.dismiss();
      }
    },
    [handleCreateAccount],
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

  useEffect(() => {
    onChangeValue('accountName')(defaultName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ContainerWithSubHeader onPressBack={goBack} title={i18n.title.readonlyAccount} disabled={isBusy}>
      <View style={WrapperStyle}>
        <ScrollView style={[ScrollViewStyle]}>
          <InputAddress
            value={formState.data.address}
            ref={formState.refs.address}
            label={formState.labels.address}
            isValidValue={formState.isValidated.address}
            onChange={onChangeAddress}
            onPressQrButton={onOpenScanner}
            containerStyle={sharedStyles.mb8}
            showAvatar={false}
            disable={isBusy}
          />
          <EditAccountInputText
            ref={formState.refs.accountName}
            label={formState.labels.accountName}
            onChangeText={onChangeValue('accountName')}
            editAccountInputStyle={sharedStyles.mb8}
            onSubmitField={onSubmitField('accountName')}
            defaultValue={formState.data.accountName}
            errorMessages={formState.errors.accountName}
            isDisabled={isBusy}
          />
        </ScrollView>
        {errors.length > 0 &&
          errors.map((message, index) => <Warning isDanger message={message} key={index} style={WarningStyle} />)}
        <View style={ActionAreaStyle}>
          <Button
            style={ButtonStyle}
            loading={isBusy}
            onPress={handleSubmit}
            disabled={errors.length > 0 || !checkValidateForm(formState.isValidated)}>
            {i18n.common.attachAccount}
          </Button>
        </View>
        <AddressScanner qrModalVisible={isScanning} onPressCancel={onCloseScanner} onChangeAddress={onScan} />
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(AttachReadOnlyScreen);
