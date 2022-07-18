import React from 'react';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { PasswordField } from 'components/Field/Password';
import { Warning } from 'components/Warning';
import i18n from 'utils/i18n/i18n';

function checkPasswordTooShort(password: string | null) {
  return !!(password && password.length < 6);
}

interface Props {
  name: string;
  onChangeName: (text: string) => void;
  pass1: string | null;
  pass2: string | null;
  onChangePass1: (curPass: string) => void;
  onChangePass2: (curPass: string) => void;
  pass2Dirty: boolean;
  isSecondPasswordValid: boolean;
  autoFocusFirstField?: boolean;
}

export const AccountNameAndPasswordArea = ({
  name,
  onChangeName,
  pass1,
  pass2,
  onChangePass1,
  onChangePass2,
  pass2Dirty,
  isSecondPasswordValid,
  autoFocusFirstField,
}: Props) => {
  return (
    <>
      <EditAccountInputText
        autoFocus={autoFocusFirstField}
        label={'Wallet Name'}
        inputValue={name}
        onChangeText={onChangeName}
        editAccountInputStyle={{ marginBottom: 8 }}
      />
      <PasswordField
        autoFocus={false}
        label={'Wallet Password'}
        onChangeText={onChangePass1}
        value={pass1 || ''}
        isError={checkPasswordTooShort(pass1)}
      />

      <PasswordField
        autoFocus={false}
        label={'Repeat Wallet Password'}
        onChangeText={onChangePass2}
        value={pass2 || ''}
        isError={checkPasswordTooShort(pass2) || pass1 !== pass2}
      />

      {!pass2 && pass2Dirty && <Warning isDanger message={i18n.warningMessage.noPasswordMessage} />}

      {isSecondPasswordValid && <Warning isDanger message={i18n.warningMessage.doNotMatchPasswordWarning} />}
    </>
  );
};
