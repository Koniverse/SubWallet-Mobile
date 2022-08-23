import React from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, MarginBottomForSubmitButton, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { SubmitButton } from 'components/SubmitButton';
import { AccountNameAndPasswordArea } from 'components/AccountNameAndPasswordArea';
import i18n from 'utils/i18n/i18n';
import useFormControl from 'hooks/screen/useFormControl';

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

export const formConfig = {
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
    require: true,
  },
};

export const AccountNamePasswordCreation = ({ isBusy, onCreateAccount }: Props) => {
  const { formState, onChangeValue, onSubmitEditing } = useFormControl(formConfig);
  return (
    <View style={sharedStyles.layoutContainer}>
      <ScrollView style={bodyAreaStyle}>
        <Text style={titleStyle}>{i18n.common.createWalletNotification}</Text>

        <AccountNameAndPasswordArea
          formState={formState}
          onChangeValue={onChangeValue}
          onSubmitEditing={onSubmitEditing}
        />
      </ScrollView>
      <View style={footerAreaStyle}>
        <SubmitButton
          disabled={
            !formState.data.password ||
            !formState.data.repeatPassword ||
            formState.data.password !== formState.data.repeatPassword
          }
          isBusy={isBusy}
          title={i18n.common.finish}
          onPress={() => {
            formState.data.password && onCreateAccount(formState.data.accountName, formState.data.password);
          }}
        />
      </View>
    </View>
  );
};
