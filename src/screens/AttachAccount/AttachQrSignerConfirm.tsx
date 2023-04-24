import Clipboard from '@react-native-clipboard/clipboard';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { AddressField } from 'components/Field/Address';
import InputCheckBox from 'components/Input/InputCheckBox';
import { SubmitButton } from 'components/SubmitButton';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import { Copy } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { AttachQrSignerConfirmProps } from 'routes/account/attachAccount';
import { RootState } from 'stores/index';
import { backToHome } from 'utils/navigation';
import { createAccountExternalV2 } from 'messaging/index';
import { ContainerHorizontalPadding, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import reformatAddress from 'utils/index';

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

function checkValidateForm(formValidated: Record<string, boolean>) {
  return formValidated.accountName;
}

const AttachQrSignerConfirm = ({ route: { params: account }, navigation: { goBack } }: AttachQrSignerConfirmProps) => {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);
  const formattedAddress = reformatAddress(account.content, 42, account.isEthereum);

  const goHome = useGoHome();
  const toast = useToast();

  const defaultName = useMemo(
    (): string => `Account ${accounts.filter(acc => acc.address !== 'ALL').length + 1}`,
    [accounts],
  );

  const [address, setAddress] = useState<string>(account.isAddress ? formattedAddress : 'ALL');
  const [isAllow, setIsAllow] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);

  const [isBusy, setIsBusy] = useState<boolean>(false);

  const formConfig = useMemo((): FormControlConfig => {
    return {
      accountName: {
        name: i18n.common.walletName,
        value: account.name || defaultName,
        require: true,
      },
    };
  }, [account, defaultName]);

  const onComplete = useCallback(() => {
    backToHome(goHome, true);
  }, [goHome]);

  const handleCreateAccount = useCallback(
    (name: string): void => {
      setIsBusy(true);

      if (account.isAddress) {
        createAccountExternalV2({
          name: name,
          address: formattedAddress,
          genesisHash: '',
          isEthereum: account.isEthereum,
          isAllowed: isAllow,
          isReadOnly: false,
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
    [account.isAddress, account.isEthereum, formattedAddress, isAllow, onComplete],
  );

  const show = useCallback(
    (text: string) => {
      toast.hideAll();
      toast.show(text);
    },
    [toast],
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

  useEffect(() => {
    onChangeValue('accountName')(account?.name || defaultName);

    if (account.isAddress) {
      setAddress(formattedAddress);
    }

    return () => {
      setErrors([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(formattedAddress);
    show(i18n.common.copiedToClipboard);
  }, [formattedAddress, show]);

  const toggleIsAllow = useCallback(() => {
    setIsAllow(state => !state);
  }, []);

  return (
    <ContainerWithSubHeader onPressBack={goBack} title={i18n.title.qrSigner} disabled={isBusy}>
      <View style={WrapperStyle}>
        <ScrollView style={[ScrollViewStyle]}>
          <AddressField
            address={address}
            label={i18n.common.accountAddress}
            showAvatar={false}
            rightIcon={Copy}
            disableText={true}
            onPressRightIcon={copyToClipboard}
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
          <InputCheckBox
            checked={isAllow}
            onPress={toggleIsAllow}
            disable={isBusy}
            label={i18n.common.autoConnectDAppAfterCreating}
          />
        </ScrollView>
        {errors.length > 0 &&
          errors.map((message, index) => <Warning isDanger message={message} key={index} style={WarningStyle} />)}
        <View style={ActionAreaStyle}>
          <SubmitButton
            disabled={!checkValidateForm(formState.isValidated) || errors.length > 0}
            isBusy={isBusy}
            style={ButtonStyle}
            title={i18n.common.attachAccount}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(AttachQrSignerConfirm);
