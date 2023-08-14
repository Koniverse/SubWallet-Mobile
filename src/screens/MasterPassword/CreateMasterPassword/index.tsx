import React, { useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { ScrollView, View } from 'react-native';
import { CheckCircle, Info } from 'phosphor-react-native';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { PasswordField } from 'components/Field/Password';
import { validatePassword, validatePasswordMatched } from 'screens/Shared/AccountNamePasswordCreation';
import { keyringChangeMasterPassword } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { CreatePasswordProps, RootNavigationProps } from 'routes/index';
import CreateMasterPasswordStyle from './style';
import { KeypairType } from '@polkadot/util-crypto/types';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import AlertBox from 'components/design-system-ui/alert-box';
import i18n from 'utils/i18n/i18n';

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

  const onComplete = async () => {
    if (pathName === 'CreateAccount') {
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: pathName, params: { keyTypes: state as KeypairType[] } }],
      });
    } else if (pathName === 'MigratePassword') {
    } else {
      navigation.reset({
        index: 1,
        routes: [{ name: 'Home' }, { name: pathName }],
      });
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
      showLeftBtn={pathName !== 'MigratePassword'}
      onPressBack={() => navigation.goBack()}
      disabled={isBusy}
      rightIcon={Info}
      disableRightButton={isBusy}
      title={i18n.header.createAPassword}
      style={{ width: '100%' }}>
      <ScrollView style={_style.bodyWrapper} keyboardShouldPersistTaps={'handled'} showsVerticalScrollIndicator={false}>
        <Typography.Text style={_style.instructionTextStyle}>
          {i18n.createPassword.createPasswordMessage}
        </Typography.Text>

        <PasswordField
          ref={formState.refs.password}
          label={formState.labels.password}
          defaultValue={formState.data.password}
          onChangeText={_onChangePasswordValue}
          errorMessages={formState.errors.password}
          onSubmitField={onSubmitField('password')}
          placeholder={i18n.placeholder.enterPassword}
          isBusy={isBusy}
          autoFocus
        />

        <PasswordField
          ref={formState.refs.repeatPassword}
          label={formState.labels.repeatPassword}
          defaultValue={formState.data.repeatPassword}
          onChangeText={onChangeValue('repeatPassword')}
          errorMessages={formState.errors.repeatPassword}
          onSubmitField={onSubmitField('repeatPassword')}
          placeholder={i18n.placeholder.confirmPassword}
          isBusy={isBusy}
        />

        <AlertBox
          type={'warning'}
          description={i18n.warning.warningPasswordMessage}
          title={i18n.warning.warningPasswordTitle}
        />
      </ScrollView>

      <View style={_style.footerAreaStyle}>
        <Button
          disabled={isDisabled}
          icon={
            <Icon
              phosphorIcon={CheckCircle}
              size={'lg'}
              weight={'fill'}
              iconColor={isDisabled ? theme.colorTextLight5 : theme.colorTextLight1}
            />
          }
          onPress={onSubmit}>
          {i18n.buttonTitles.continue}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};

export default CreateMasterPassword;
