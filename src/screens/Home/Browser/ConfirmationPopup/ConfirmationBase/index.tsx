import {
  ConfirmationHeader,
  ConfirmationHeaderType,
} from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase/ConfirmationHeader';
import {
  ConfirmationFooter,
  ConfirmationFooterType,
} from 'screens/Home/Browser/ConfirmationPopup/ConfirmationBase/ConfirmationFooter';
import { ScrollView, View } from 'react-native';
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
  isUseScrollView?: boolean;
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

interface BusyType {
  isBusy: boolean;
  busyKey: BusyKey | null;
}

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
  isUseScrollView = true,
}: Props) => {
  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: () => {},
  });
  const [{ isBusy, busyKey }, setBusy] = useState<BusyType>({ busyKey: null, isBusy: false });

  const _onPressSubmitButton = () => {
    if (onPressSubmitButton) {
      setBusy({ busyKey: 'SUBMIT', isBusy: true });
      onPressSubmitButton(formState.data.password)
        .then(res => console.log(res))
        .catch(e => {
          onUpdateErrors('password')([e.message]);
        })
        .finally(() => {
          setBusy((prevState: BusyType) => ({ ...prevState, isBusy: false }));
        });
    }
  };

  const _onPressBlockButton = () => {
    if (onPressBlockButton) {
      setBusy({ busyKey: 'BLOCK', isBusy: true });

      onPressBlockButton().finally(() => {
        setBusy((prevState: BusyType) => ({ ...prevState, isBusy: false }));
      });
    }
  };

  const _onPressCancelButton = () => {
    if (onPressCancelButton) {
      setBusy({ busyKey: 'CANCEL', isBusy: true });

      onPressCancelButton().finally(() => {
        setBusy((prevState: BusyType) => ({ ...prevState, isBusy: false }));
      });
    }
  };

  return (
    <>
      {isUseScrollView ? (
        <ScrollView style={{ width: '100%' }}>
          <ConfirmationHeader {...headerProps} />
          {children}
        </ScrollView>
      ) : (
        <View style={{ width: '100%' }}>
          <ConfirmationHeader {...headerProps} />
          {children}
        </View>
      )}

      {isShowPassword && (
        <View style={{ width: '100%', paddingTop: 8, paddingHorizontal: 16 }}>
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
      )}
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
