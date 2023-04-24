import Clipboard from '@react-native-clipboard/clipboard';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { AddressField } from 'components/Field/Address';
import InputCheckBox from 'components/Input/InputCheckBox';
import { SubmitButton } from 'components/SubmitButton';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import { Copy } from 'phosphor-react-native';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';
import { ImportAccountQrConfirmProps } from 'routes/account/attachAccount';
import { RootState } from 'stores/index';
import { backToHome } from 'utils/navigation';
import { checkPublicAndPrivateKey, createAccountWithSecret } from 'messaging/index';
import { centerStyle, ContainerHorizontalPadding, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';

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

const ImportAccountQrConfirm = ({
  route: { params: account },
  navigation: { goBack },
}: ImportAccountQrConfirmProps) => {
  const accounts = useSelector((state: RootState) => state.accountState.accounts);

  const goHome = useGoHome();
  const toast = useToast();

  const defaultName = useMemo(
    (): string => `Account ${accounts.filter(acc => acc.address !== 'ALL').length + 1}`,
    [accounts],
  );

  const [address, setAddress] = useState<string>(account.isAddress ? account.content : 'ALL');
  const [isEthereum, setIsEthereum] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isAllow, setIsAllow] = useState<boolean>(true);

  const [loading, setLoading] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  useHandlerHardwareBackPress(isBusy);

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

      if (!account.isAddress) {
        createAccountWithSecret({
          name,
          isAllow: isAllow,
          secretKey: account.content,
          publicKey: account.genesisHash,
          isEthereum: isEthereum,
        })
          .then(({ errors: errs, success }) => {
            if (success) {
              onComplete();
            } else {
              setErrors(errs.map(e => e.message));
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
    [account, isAllow, isEthereum, onComplete],
  );

  const onSubmitForm = useCallback(
    (formState: FormState) => {
      handleCreateAccount(formState.data.accountName);
    },
    [handleCreateAccount],
  );

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: onSubmitForm,
  });

  const handleSubmit = useCallback(() => {
    onSubmitForm(formState);
  }, [formState, onSubmitForm]);

  const toggleIsAllow = useCallback(() => {
    setIsAllow(state => !state);
  }, []);

  const show = useCallback(
    (text: string) => {
      toast.hideAll();
      toast.show(text);
    },
    [toast],
  );

  const copyToClipboard = useCallback(() => {
    Clipboard.setString(account.content);
    show(i18n.common.copiedToClipboard);
  }, [account.content, show]);

  useEffect(() => {
    let amount = true;
    onChangeValue('accountName')(account?.name || defaultName);

    if (!account.isAddress) {
      setLoading(true);
      checkPublicAndPrivateKey(account.genesisHash, account.content)
        .then(({ address: _address, isValid, isEthereum: _isEthereum }) => {
          if (amount) {
            if (isValid) {
              setAddress(_address);
              setIsEthereum(_isEthereum);
            } else {
              setErrors([i18n.warningMessage.cannotExtractAddress]);
            }
            setLoading(false);
          }
        })
        .catch(e => {
          if (amount) {
            const error = (e as Error).message;
            console.error(error);
            setErrors([error]);
            setLoading(false);
          }
        });
    } else {
      goBack();
    }

    return () => {
      amount = false;
      setErrors([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <ContainerWithSubHeader onPressBack={goBack} title={i18n.title.importByQrCode} disabled={isBusy}>
      <View style={WrapperStyle}>
        <ScrollView style={[ScrollViewStyle]} contentContainerStyle={loading ? { ...centerStyle } : undefined}>
          {loading ? (
            <ActivityIndicator size={'large'} animating={true} />
          ) : (
            <>
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
                editAccountInputStyle={{ marginBottom: 8 }}
                onSubmitField={onSubmitField('accountName')}
                defaultValue={formState.data.accountName}
                errorMessages={formState.errors.accountName}
                isDisabled
              />
              <InputCheckBox
                checked={isAllow}
                onPress={toggleIsAllow}
                disable={isBusy}
                label={i18n.common.autoConnectDAppAfterCreating}
              />
            </>
          )}
        </ScrollView>
        {errors.length > 0 &&
          errors.map((message, index) => <Warning isDanger message={message} key={index} style={WarningStyle} />)}
        <View style={ActionAreaStyle}>
          <SubmitButton
            disabled={loading || errors.length > 0}
            isBusy={isBusy}
            style={ButtonStyle}
            title={i18n.common.importAccount}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default ImportAccountQrConfirm;
