import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { AddressField } from 'components/Field/Address';
import { PasswordField } from 'components/Field/Password';
import { SubmitButton } from 'components/SubmitButton';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Keyboard, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { ImportAccountQrConfirmProps } from 'routes/account/import/importAccountQr';
import { validatePassword, validatePasswordMatched } from 'screens/Shared/AccountNamePasswordCreation';
import { RootState } from 'stores/index';
import { backToHome } from 'utils/navigation';
import { createAccountExternalV2, checkPublicAndPrivateKey, createAccountWithSecret } from '../../messaging';
import { ColorMap } from 'styles/color';
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
  marginHorizontal: -4,
  flexDirection: 'row',
};

const ButtonStyle: StyleProp<ViewStyle> = {
  flex: 1,
  marginHorizontal: 4,
};

function checkValidateForm(formValidated: Record<string, boolean>, needPassword: boolean) {
  return formValidated.accountName && (needPassword ? formValidated.password && formValidated.repeatPassword : true);
}

const ImportAccountQrConfirm = ({
  route: { params: account },
  navigation: { goBack },
}: ImportAccountQrConfirmProps) => {
  const accounts = useSelector((state: RootState) => state.accounts.accounts);

  const goHome = useGoHome();

  const defaultName = useMemo(
    (): string => `Account ${accounts.filter(acc => acc.address !== 'ALL').length + 1}`,
    [accounts],
  );

  const [address, setAddress] = useState<string>(account.isAddress ? account.content : 'ALL');
  const [isEthereum, setIsEthereum] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(true);

  const formConfig = useMemo((): FormControlConfig => {
    return {
      accountName: {
        name: i18n.common.walletName,
        value: account.name || defaultName,
        require: true,
      },
      password: {
        name: i18n.common.walletPassword,
        value: '',
        validateFunc: validatePassword,
        require: !account.isAddress,
      },
      repeatPassword: {
        name: i18n.common.repeatWalletPassword,
        value: '',
        validateFunc: (value: string, formValue: Record<string, string>) => {
          return validatePasswordMatched(value, formValue.password);
        },
        require: !account.isAddress,
      },
    };
  }, [account, defaultName]);

  const onComplete = useCallback(() => {
    backToHome(goHome, true);
  }, [goHome]);

  const handleCreateAccount = useCallback(
    (name: string, password: string): void => {
      setIsBusy(true);

      if (account.isAddress) {
        createAccountExternalV2({
          name: name,
          address: account.content,
          genesisHash: account.genesisHash,
          isEthereum: account.isEthereum,
          isAllowed: true,
          isReadOnly: isReadOnly,
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
      } else if (password) {
        createAccountWithSecret({
          name,
          password,
          isAllow: true,
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
    [account, isEthereum, isReadOnly, onComplete],
  );

  const onSubmitForm = useCallback(
    (formState: FormState) => {
      if (checkValidateForm(formState.isValidated, !account.isAddress)) {
        handleCreateAccount(formState.data.accountName, formState.data.password);
      } else {
        Keyboard.dismiss();
      }
    },
    [handleCreateAccount, account.isAddress],
  );

  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: onSubmitForm,
  });

  const _onChangePasswordValue = useCallback(
    (currentValue: string) => {
      if (formState.data.repeatPassword) {
        onChangeValue('repeatPassword')('');
      }
      onChangeValue('password')(currentValue);
    },
    [formState.data.repeatPassword, onChangeValue],
  );

  const handleSubmit = useCallback(() => {
    onSubmitForm(formState);
  }, [formState, onSubmitForm]);

  useEffect(() => {
    let amount = true;
    onChangeValue('accountName')(account?.name || defaultName);
    setIsReadOnly(true);

    if (account.isAddress) {
      setAddress(account.content);
      setIsEthereum(account.isEthereum);
      setLoading(false);
    } else {
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
    }

    return () => {
      amount = false;
      setErrors([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <ContainerWithSubHeader onPressBack={goBack} title={i18n.title.importByQr} disabled={isBusy}>
      <View style={WrapperStyle}>
        <ScrollView style={[ScrollViewStyle]} contentContainerStyle={loading ? { ...centerStyle } : undefined}>
          {loading ? (
            <ActivityIndicator size={'large'} animating={true} />
          ) : (
            <>
              <AddressField address={address} label={i18n.common.account} showRightIcon={false} />
              <EditAccountInputText
                ref={formState.refs.accountName}
                label={formState.labels.accountName}
                onChangeText={onChangeValue('accountName')}
                editAccountInputStyle={{ marginBottom: 8 }}
                onSubmitField={onSubmitField('accountName')}
                defaultValue={formState.data.accountName}
                errorMessages={formState.errors.accountName}
                isDisabled={isBusy}
              />
              {!account.isAddress && (
                <>
                  <PasswordField
                    ref={formState.refs.password}
                    label={formState.labels.password}
                    defaultValue={formState.data.password}
                    onChangeText={_onChangePasswordValue}
                    errorMessages={formState.errors.password}
                    onSubmitField={onSubmitField('password')}
                    isBusy={isBusy}
                  />
                  <PasswordField
                    ref={formState.refs.repeatPassword}
                    label={formState.labels.repeatPassword}
                    defaultValue={formState.data.repeatPassword}
                    onChangeText={onChangeValue('repeatPassword')}
                    errorMessages={formState.errors.repeatPassword}
                    onSubmitField={onSubmitField('repeatPassword')}
                    isBusy={isBusy}
                  />
                </>
              )}
            </>
          )}
        </ScrollView>
        {errors.length > 0 &&
          errors.map((message, index) => <Warning isDanger message={message} key={index} style={WarningStyle} />)}
        <View style={ActionAreaStyle}>
          <SubmitButton
            disabled={isBusy}
            disabledColor={ColorMap.buttonOverlayButtonColor}
            title={i18n.common.cancel}
            backgroundColor={ColorMap.dark2}
            style={ButtonStyle}
            onPress={goBack}
          />
          <SubmitButton
            disabled={!checkValidateForm(formState.isValidated, !account.isAddress) || loading || errors.length > 0}
            isBusy={isBusy}
            style={ButtonStyle}
            title={i18n.common.finish}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default React.memo(ImportAccountQrConfirm);
