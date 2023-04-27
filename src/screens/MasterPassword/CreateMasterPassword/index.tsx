import React, { useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { View } from 'react-native';
import { CheckCircle, Info } from 'phosphor-react-native';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { PasswordField } from 'components/Field/Password';
import i18n from 'utils/i18n/i18n';
import { validatePassword, validatePasswordMatched } from 'screens/Shared/AccountNamePasswordCreation';
import { Warning } from 'components/Warning';
import { keyringChangeMasterPassword } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { CreatePasswordProps, RootNavigationProps } from 'routes/index';
import CreateMasterPasswordStyle from './style';
import { KeypairType } from '@polkadot/util-crypto/types';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';

const formConfig: FormControlConfig = {
  password: {
    name: i18n.common.walletPassword,
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
  repeatPassword: {
    name: i18n.common.repeatWalletPassword,
    value: '',
    validateFunc: (value: string, formValue: Record<string, string>) => {
      return validatePasswordMatched(value, formValue.password);
    },
    require: true,
  },
};

function checkValidateForm(isValidated: Record<string, boolean>) {
  return isValidated.password && isValidated.repeatPassword;
}

const CreateMasterPassword = ({
  route: {
    params: { pathName, state },
  },
}: CreatePasswordProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const _style = CreateMasterPasswordStyle(theme);
  const [isBusy, setIsBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  useHandlerHardwareBackPress(true);

  const onComplete = async () => {
    if (pathName === 'CreateAccount') {
      navigation.navigate(pathName, { keyTypes: state as KeypairType });
    } else if (pathName === 'MigratePassword') {
      navigation.navigate(pathName);
    } else {
      navigation.navigate(pathName);
    }
  };

  const onSubmit = () => {
    if (checkValidateForm(formState.isValidated)) {
      const password = formState.data.password;

      if (password) {
        setIsBusy(true);
        keyringChangeMasterPassword({
          createNew: true,
          newPassword: password,
        })
          .then(res => {
            if (!res.status) {
              setErrors(res.errors);
            } else {
              onComplete();
              // TODO: complete
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

  const _onChangePasswordValue = (currentValue: string) => {
    if (formState.data.repeatPassword) {
      onChangeValue('repeatPassword')('');
    }
    onChangeValue('password')(currentValue);
  };

  const isDisabled = useMemo(() => {
    return !checkValidateForm(formState.isValidated) || (errors && errors.length > 0) || isBusy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors, formState.isValidated.password, formState.isValidated.repeatPassword, isBusy]);

  return (
    <ContainerWithSubHeader
      showLeftBtn={false}
      onPressBack={() => navigation.goBack()}
      rightIcon={Info}
      title={'Create password'}
      style={{ width: '100%' }}>
      <View style={_style.bodyWrapper}>
        <Typography.Text style={_style.instructionTextStyle}>Use this password to unlock your account.</Typography.Text>

        <PasswordField
          ref={formState.refs.password}
          label={formState.labels.password}
          defaultValue={formState.data.password}
          onChangeText={_onChangePasswordValue}
          errorMessages={formState.errors.password}
          onSubmitField={onSubmitField('password')}
        />

        <PasswordField
          ref={formState.refs.repeatPassword}
          label={formState.labels.repeatPassword}
          defaultValue={formState.data.repeatPassword}
          onChangeText={onChangeValue('repeatPassword')}
          errorMessages={formState.errors.repeatPassword}
          onSubmitField={onSubmitField('repeatPassword')}
        />

        <Warning message={'Recommended security practice'} title={'Always choose a strong password!'} />
      </View>

      <View style={_style.footerAreaStyle}>
        <Button
          disabled={isDisabled}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              size={'lg'}
              iconColor={isDisabled ? theme.colorTextLight5 : theme.colorTextLight1}
            />
          }
          onPress={onSubmit}>
          {'Finish'}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};

export default CreateMasterPassword;
