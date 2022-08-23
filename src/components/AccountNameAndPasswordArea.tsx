import React from 'react';
import { EditAccountInputText } from 'components/EditAccountInputText';
import { PasswordField } from 'components/Field/Password';
import { FormState } from 'hooks/screen/useFormControl';

interface Props {
  formState: FormState;
  onChangeValue: (fieldName: string) => (currentValue: string) => void;
  onSubmitEditing: (fieldName: string) => () => void;
}

export const AccountNameAndPasswordArea = ({ formState, onChangeValue, onSubmitEditing }: Props) => {
  return (
    <>
      <EditAccountInputText
        ref={formState.refs.accountName}
        label={formState.labels.accountName}
        onChangeText={onChangeValue('accountName')}
        editAccountInputStyle={{ marginBottom: 8 }}
        onSubmitEditing={onSubmitEditing('accountName')}
        errorMessages={formState.errors.accountName}
      />
      <PasswordField
        ref={formState.refs.password}
        label={formState.labels.password}
        onChangeText={onChangeValue('password')}
        errorMessages={formState.errors.password}
        onSubmitEditing={onSubmitEditing('password')}
      />

      <PasswordField
        ref={formState.refs.repeatPassword}
        label={formState.labels.repeatPassword}
        onChangeText={onChangeValue('repeatPassword')}
        errorMessages={formState.errors.repeatPassword}
        onSubmitEditing={onSubmitEditing('repeatPassword')}
      />
    </>
  );
};
