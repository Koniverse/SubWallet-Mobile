import { Warning } from 'components/Warning';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import React, { useCallback, useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { View } from 'react-native';
import { CheckCircle, Info } from 'phosphor-react-native';
import { Button, Icon } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useFormControl from 'hooks/screen/useFormControl';
import { PasswordField } from 'components/Field/Password';
import { validatePassword, validatePasswordMatched } from 'screens/Shared/AccountNamePasswordCreation';
import { keyringChangeMasterPassword } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import ChangeMasterPasswordStyle from './style';
import { backToHome } from 'utils/navigation';
import useGoHome from 'hooks/screen/useGoHome';
import i18n from 'utils/i18n/i18n';

const formConfig = {
  curPassword: {
    name: i18n.inputLabel.currentPassword,
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
  password: {
    name: i18n.inputLabel.newPassword,
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
  repeatPassword: {
    name: i18n.inputLabel.confirmNewPassword,
    value: '',
    validateFunc: (value: string, formValue: Record<string, string>) => {
      return validatePasswordMatched(value, formValue.password);
    },
    require: true,
  },
};

function checkValidateForm(isValidated: Record<string, boolean>) {
  return isValidated.password && isValidated.repeatPassword && isValidated.curPassword;
}

const ChangeMasterPassword = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const goHome = useGoHome();
  const _style = ChangeMasterPasswordStyle(theme);
  const [isBusy, setIsBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useHandlerHardwareBackPress(isBusy);

  const _backToHome = useCallback(() => {
    backToHome(goHome);
  }, [goHome]);

  const onSubmit = () => {
    if (checkValidateForm(formState.isValidated)) {
      const password = formState.data.password;
      const oldPassword = formState.data.curPassword;

      if (password && oldPassword) {
        setIsBusy(true);
        keyringChangeMasterPassword({
          createNew: false,
          newPassword: password,
          oldPassword: oldPassword,
        })
          .then(res => {
            if (!res.status) {
              setErrors(res.errors);
            } else {
              _backToHome();
            }
          })
          .catch(e => {
            setErrors([e.message]);
          })
          .finally(() => {
            setIsBusy(false);
          });
      }
    }
  };
  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const onChangeField = useCallback(
    (fieldName: string) => {
      return (value: string) => {
        setErrors([]);
        onChangeValue(fieldName)(value);
      };
    },
    [onChangeValue],
  );

  const _onChangePasswordValue = (currentValue: string) => {
    if (formState.data.repeatPassword) {
      onChangeField('repeatPassword')('');
    }

    onChangeField('password')(currentValue);
  };

  const isDisabled = useMemo(() => {
    return !checkValidateForm(formState.isValidated) || (errors && errors.length > 0) || isBusy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    errors,
    formState.isValidated.password,
    formState.isValidated.repeatPassword,
    formState.isValidated.curPassword,
    isBusy,
  ]);

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={() => navigation.goBack()}
      rightIcon={Info}
      title={i18n.header.changePassword}
      style={{ width: '100%' }}
      disabled={isBusy}
      disableRightButton={isBusy}>
      <View style={_style.bodyWrapper}>
        <PasswordField
          ref={formState.refs.curPassword}
          label={formState.labels.curPassword}
          defaultValue={formState.data.curPassword}
          onChangeText={onChangeField('curPassword')}
          errorMessages={formState.errors.curPassword}
          onSubmitField={onSubmitField('curPassword')}
          isBusy={isBusy}
        />

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
          onChangeText={onChangeField('repeatPassword')}
          errorMessages={formState.errors.repeatPassword}
          onSubmitField={onSubmitField('repeatPassword')}
          isBusy={isBusy}
        />
        {errors.length > 0 &&
          errors.map((message, index) => <Warning isDanger message={message} key={index} style={_style.error} />)}
      </View>

      <View style={_style.footerAreaStyle}>
        <Button
          disabled={isDisabled}
          loading={isBusy}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              size={'lg'}
              iconColor={isDisabled ? theme.colorTextLight5 : theme.colorTextLight1}
            />
          }
          onPress={onSubmit}>
          {i18n.buttonTitles.finish}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};

export default ChangeMasterPassword;
