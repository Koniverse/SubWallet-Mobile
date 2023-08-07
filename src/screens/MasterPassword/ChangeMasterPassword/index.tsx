import { Warning } from 'components/Warning';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import React, { useCallback, useMemo, useState } from 'react';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { ScrollView, View } from 'react-native';
import { ArrowCircleRight, CheckCircle, Info } from 'phosphor-react-native';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useFormControl from 'hooks/screen/useFormControl';
import { PasswordField } from 'components/Field/Password';
import { validatePassword, validatePasswordMatched } from 'screens/Shared/AccountNamePasswordCreation';
import { keyringChangeMasterPassword, keyringUnlock } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import ChangeMasterPasswordStyle from './style';
import { backToHome } from 'utils/navigation';
import useGoHome from 'hooks/screen/useGoHome';
import i18n from 'utils/i18n/i18n';
import AlertBox from 'components/design-system-ui/alert-box';
import { FontSemiBold } from 'styles/sharedStyles';

function checkValidateForm(isValidated: Record<string, boolean>) {
  return isValidated.password && isValidated.repeatPassword;
}

type PageStep = 'OldPassword' | 'NewPassword';

const ChangeMasterPassword = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const goHome = useGoHome();
  const _style = ChangeMasterPasswordStyle(theme);
  const [isBusy, setIsBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<PageStep>('OldPassword');
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
  const { formState, onChangeValue, onUpdateErrors, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const onNextStep = () => {
    const oldPassword = formState.data.curPassword;
    if (!oldPassword) {
      onUpdateErrors('curPassword')([i18n.warningMessage.requireMessage]);
      return;
    }
    setIsBusy(true);
    keyringUnlock({ password: oldPassword })
      .then(data => {
        if (!data.status) {
          onUpdateErrors('curPassword')([i18n.errorMessage.invalidMasterPassword]);
        } else {
          setStep('NewPassword');
        }
      })
      .catch((e: Error) => {
        onUpdateErrors('curPassword')([e.message]);
      })
      .finally(() => {
        setIsBusy(false);
      });
  };

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
    if (step === 'OldPassword') {
      return !formState.isValidated.curPassword || isBusy;
    } else {
      return (
        !checkValidateForm(formState.isValidated) ||
        (errors && errors.length > 0) ||
        isBusy ||
        !formState.data.password ||
        !formState.data.repeatPassword
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    step,
    errors,
    formState.isValidated.password,
    formState.isValidated.repeatPassword,
    formState.isValidated.curPassword,
    isBusy,
  ]);

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={() => {
        if (step === 'OldPassword') {
          navigation.goBack();
        } else {
          onChangeValue('curPassword')('');
          onChangeValue('password')('');
          onChangeValue('repeatPassword')('');
          onUpdateErrors('curPassword')(undefined);
          onUpdateErrors('password')(undefined);
          onUpdateErrors('repeatPassword')(undefined);
          setStep('OldPassword');
        }
      }}
      rightIcon={Info}
      title={step === 'OldPassword' ? i18n.header.currentPassword : i18n.header.newPassword}
      style={{ width: '100%' }}
      disabled={isBusy}
      disableRightButton={isBusy}>
      <Typography.Text
        style={{
          fontSize: theme.fontSize,
          lineHeight: theme.fontSize * theme.lineHeight,
          color: theme.colorTextTertiary,
          ...FontSemiBold,
          textAlign: 'center',
          paddingTop: theme.padding,
          paddingBottom: theme.paddingLG,
          paddingHorizontal: theme.padding,
        }}>
        {step === 'OldPassword' ? i18n.message.changeMasterPasswordMessage1 : i18n.message.changeMasterPasswordMessage2}
      </Typography.Text>

      <ScrollView style={_style.bodyWrapper} showsVerticalScrollIndicator={false}>
        {step === 'OldPassword' && (
          <PasswordField
            ref={formState.refs.curPassword}
            label={formState.labels.curPassword}
            defaultValue={formState.data.curPassword}
            onChangeText={onChangeField('curPassword')}
            errorMessages={formState.errors.curPassword}
            onSubmitField={onNextStep}
            isBusy={isBusy}
            autoFocus
          />
        )}

        {step === 'NewPassword' && (
          <>
            <PasswordField
              ref={formState.refs.password}
              label={formState.labels.password}
              defaultValue={formState.data.password}
              onChangeText={_onChangePasswordValue}
              errorMessages={formState.errors.password}
              onSubmitField={onSubmitField('password')}
              isBusy={isBusy}
              autoFocus
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

            <AlertBox
              title={i18n.warning.warningPasswordTitle}
              description={i18n.warning.warningPasswordMessage}
              type={'warning'}
            />
          </>
        )}
        {errors.length > 0 &&
          errors.map((message, index) => <Warning isDanger message={message} key={index} style={_style.error} />)}
      </ScrollView>

      <View style={_style.footerAreaStyle}>
        <Button
          disabled={isDisabled}
          loading={isBusy}
          icon={
            <Icon
              phosphorIcon={step === 'OldPassword' ? ArrowCircleRight : CheckCircle}
              size={'lg'}
              iconColor={isDisabled ? theme.colorTextLight5 : theme.colorTextLight1}
              weight={'fill'}
            />
          }
          onPress={step === 'OldPassword' ? onNextStep : onSubmit}>
          {step === 'OldPassword' ? i18n.buttonTitles.next : i18n.buttonTitles.finish}
        </Button>
      </View>
    </ContainerWithSubHeader>
  );
};

export default ChangeMasterPassword;
