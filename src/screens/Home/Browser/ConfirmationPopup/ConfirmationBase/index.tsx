import {
  ConfirmationHeader,
  ConfirmationHeaderType,
} from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase/ConfirmationHeader';
import {
  ConfirmationFooter,
  ConfirmationFooterType,
} from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase/ConfirmationFooter';
import { View } from 'react-native';
import React, { useState } from 'react';
import { PasswordField } from 'components/Field/Password';
import { ColorMap } from 'styles/color';
import useFormControl from 'hooks/screen/useFormControl';
import i18n from 'utils/i18n/i18n';

interface Props {
  headerProps: ConfirmationHeaderType;
  footerProps: {
    onPressSubmitButton?: (password: string) => Promise<void>;
    onPressCancelButton?: () => Promise<void>;
    onPressBlockButton?: () => Promise<void>;
  } & Omit<ConfirmationFooterType, 'onPressSubmitButton' | 'onPressCancelButton' | 'onPressBlockButton'>;
  children?: JSX.Element;
  isShowPassword?: boolean;
}

type BusyKey = 'CANCEL' | 'SUBMIT' | 'BLOCK';

export interface ConfirmationBaseRef {
  onPasswordError: (e: Error) => void;
}

const formConfig = {
  password: {
    name: i18n.common.password,
    value: '',
  },
};

export const ConfirmationBase = ({
  headerProps,
  footerProps: {
    onPressSubmitButton,
    onPressBlockButton,
    onPressCancelButton,
    isBlockButtonBusy,
    isBlockButtonDisabled,
    isCancelButtonBusy,
    isCancelButtonDisabled,
    isSubmitButtonBusy,
    isSubmitButtonDisabled,
    ...footerProps
  },
  children,
  isShowPassword,
}: Props) => {
  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: () => {},
  });
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [busyKey, setBusyKey] = useState<BusyKey | null>(null);

  const _onPressSubmitButton = () => {
    if (onPressSubmitButton) {
      setBusyKey('SUBMIT');
      setIsBusy(true);
      onPressSubmitButton(formState.data.password)
        .then(res => console.log(res))
        .catch(e => {
          onUpdateErrors('password')([e.message]);
        })
        .finally(() => {
          setIsBusy(false);
        });
    }
  };

  const _onPressBlockButton = () => {
    if (onPressBlockButton) {
      setBusyKey('BLOCK');
      setIsBusy(true);

      onPressBlockButton().finally(() => {
        setIsBusy(false);
      });
    }
  };

  const _onPressCancelButton = () => {
    if (onPressCancelButton) {
      setBusyKey('CANCEL');
      setIsBusy(true);

      onPressCancelButton().finally(() => {
        setIsBusy(false);
      });
    }
  };

  return (
    <>
      <ConfirmationHeader {...headerProps} />
      {children}

      <View style={{ width: '100%', paddingTop: 8, paddingHorizontal: 16 }}>
        {isShowPassword && (
          <PasswordField
            label={formState.labels.password}
            fieldBgc={ColorMap.dark1}
            defaultValue={formState.data.password}
            onChangeText={onChangeValue('password')}
            isBusy={false}
            errorMessages={formState.errors.password}
            onSubmitField={onSubmitField('password')}
          />
        )}
      </View>
      <ConfirmationFooter
        {...footerProps}
        onPressCancelButton={_onPressCancelButton}
        onPressBlockButton={_onPressBlockButton}
        onPressSubmitButton={_onPressSubmitButton}
        isBlockButtonBusy={isBlockButtonBusy || (isBusy && busyKey === 'BLOCK')}
        isBlockButtonDisabled={isBlockButtonDisabled || isBusy}
        isCancelButtonBusy={isCancelButtonBusy || (isBusy && busyKey === 'CANCEL')}
        isCancelButtonDisabled={isCancelButtonDisabled || isBusy}
        isSubmitButtonBusy={isSubmitButtonBusy || (isBusy && busyKey === 'SUBMIT')}
        isSubmitButtonDisabled={isSubmitButtonDisabled || isBusy || (isShowPassword && !formState.data.password)}
      />
    </>
  );
};
