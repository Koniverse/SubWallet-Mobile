import React from 'react';
import { Keyboard, ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, MarginBottomForSubmitButton, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { SubmitButton } from 'components/SubmitButton';
import { AccountNameAndPasswordArea } from 'components/AccountNameAndPasswordArea';
import i18n from 'utils/i18n/i18n';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  ...ScrollViewStyle,
};

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  ...MarginBottomForSubmitButton,
};

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  textAlign: 'center',
  paddingHorizontal: 20,
  ...FontMedium,
  paddingBottom: 26,
};

interface Props {
  isBusy?: boolean;
  onCreateAccount: (curName: string, password: string) => void;
}

export function checkPasswordLength(value: string) {
  return !!(value && value.length > 5);
}

export function checkPasswordTooShort(value: string) {
  const isPasswordTooShort = !checkPasswordLength(value);
  if (isPasswordTooShort) {
    return [i18n.warningMessage.passwordTooShort];
  } else {
    return [];
  }
}

export function checkPasswordMatched(value: string, formValue: Record<string, string>) {
  const isPasswordTooShort = !checkPasswordLength(value);
  if (isPasswordTooShort) {
    return [i18n.warningMessage.passwordTooShort];
  } else {
    if (formValue.password !== value) {
      return [i18n.warningMessage.doNotMatchPasswordWarning];
    } else {
      return [];
    }
  }
}

function checkValidateForm(formValidated: Record<string, boolean>) {
  console.log('33', formValidated.accountName, formValidated.password, formValidated.repeatPassword);
  return formValidated.accountName && formValidated.password && formValidated.repeatPassword;
}

export const AccountNamePasswordCreation = ({ isBusy, onCreateAccount }: Props) => {
  const _onCreateAccount = (formState: FormState) => {
    console.log('formState.isValidated', checkValidateForm(formState.isValidated));
    if (checkValidateForm(formState.isValidated)) {
      console.log('123123123123');
      onCreateAccount(formState.data.accountName, formState.data.password);
    } else {
      Keyboard.dismiss();
    }
  };

  const formConfig = {
    accountName: {
      name: i18n.common.accountName,
      value: '',
      require: true,
    },
    password: {
      name: i18n.common.walletPassword,
      value: '',
      validateFunc: checkPasswordTooShort,
      require: true,
    },
    repeatPassword: {
      name: i18n.common.repeatWalletPassword,
      value: '',
      validateFunc: checkPasswordMatched,
      onSubmitForm: _onCreateAccount,
      require: true,
    },
  };
  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig);
  return (
    <View style={sharedStyles.layoutContainer}>
      <ScrollView style={bodyAreaStyle}>
        <Text style={titleStyle}>{i18n.common.createWalletNotification}</Text>

        <AccountNameAndPasswordArea formState={formState} onChangeValue={onChangeValue} onSubmitField={onSubmitField} />
      </ScrollView>
      <View style={footerAreaStyle}>
        <SubmitButton
          disabled={!checkValidateForm(formState.isValidated)}
          isBusy={isBusy}
          title={i18n.common.finish}
          onPress={() => {}}
        />
      </View>
    </View>
  );
};
