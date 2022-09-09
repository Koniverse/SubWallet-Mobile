import { ConfirmationHeader, ConfirmationHeaderType } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationHeader';
import { ConfirmationFooter, ConfirmationFooterType } from 'screens/Home/Browser/ConfirmationPopup/ConfirmationFooter';
import { View } from 'react-native';
import React, { ForwardedRef, forwardRef, useImperativeHandle } from 'react';
import { PasswordField } from 'components/Field/Password';
import { ColorMap } from 'styles/color';
import useFormControl from 'hooks/screen/useFormControl';
import i18n from 'utils/i18n/i18n';

interface Props {
  headerProps: ConfirmationHeaderType;
  footerProps: {
    onPressSubmitButton: (password: string) => void;
  } & Omit<ConfirmationFooterType, 'onPressSubmitButton'>;
  children?: JSX.Element;
  isShowPassword?: boolean;
}

export interface ConfirmationBaseRef {
  onPasswordError: (e: Error) => void;
}

const formConfig = {
  password: {
    name: i18n.common.password,
    value: '',
  },
};

const Component = (
  { headerProps, footerProps: { onPressSubmitButton, ...footerProps }, children }: Props,
  ref: ForwardedRef<ConfirmationBaseRef>,
) => {
  const { formState, onChangeValue, onSubmitField } = useFormControl(formConfig, {
    onSubmitForm: () => {},
  });

  useImperativeHandle(ref, () => ({
    onPasswordError: (e: Error) => {},
  }));

  const _onPressSubmitButton = () => {
    onPressSubmitButton && onPressSubmitButton('');
  };

  return (
    <>
      <ConfirmationHeader {...headerProps} />
      {children}

      <View style={{ width: '100%', paddingTop: 8 }}>
        <PasswordField
          label={formState.labels.password}
          fieldBgc={ColorMap.dark1}
          defaultValue={formState.data.password}
          onChangeText={onChangeValue('password')}
          isBusy={false}
          errorMessages={formState.errors.password}
          onSubmitField={onSubmitField('password')}
        />
      </View>
      <ConfirmationFooter {...footerProps} onPressSubmitButton={_onPressSubmitButton} />
    </>
  );
};

export const ConfirmationBase = forwardRef(Component);
