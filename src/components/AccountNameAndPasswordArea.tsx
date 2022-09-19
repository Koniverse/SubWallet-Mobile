import React from 'react';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { PasswordField } from 'components/Field/Password';
import { FormState } from 'hooks/screen/useFormControl';

interface Props {
  formState: FormState;
  onChangeValue: (fieldName: string) => (currentValue: string) => void;
  onSubmitField: (fieldName: string) => () => void;
  autoFocusFirstField?: boolean;
}

export const AccountNameAndPasswordArea = ({ formState, onChangeValue, onSubmitField }: Props) => {
  const _onChangePasswordValue = (currentValue: string) => {
    if (formState.data.repeatPassword) {
      onChangeValue('repeatPassword')('');
    }
    onChangeValue('password')(currentValue);
  };

  return (
    <>
      <EditAccountInputText
        ref={formState.refs.accountName}
        label={formState.labels.accountName}
        onChangeText={onChangeValue('accountName')}
        editAccountInputStyle={{ marginBottom: 8 }}
        onSubmitField={onSubmitField('accountName')}
        defaultValue={formState.data.accountName}
        errorMessages={formState.errors.accountName}
      />
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
    </>
  );
};
