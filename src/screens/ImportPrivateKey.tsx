import React, { useEffect, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Keyboard, ScrollView, StyleProp, View } from 'react-native';
import { MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { SubmitButton } from 'components/SubmitButton';
import { AccountNameAndPasswordArea } from 'components/AccountNameAndPasswordArea';
import { createAccountSuriV2, validateMetamaskPrivateKeyV2 } from '../messaging';
import { Textarea } from 'components/Textarea';
import { EVM_ACCOUNT_TYPE } from '../constant';
import { backToHome } from 'utils/navigation';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import { validatePassword, validatePasswordMatched } from 'screens/Shared/AccountNamePasswordCreation';
import { ColorMap } from 'styles/color';

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginHorizontal: 16,
  ...MarginBottomForSubmitButton,
};

function checkValidateForm(isValidated: Record<string, boolean>) {
  return isValidated.privateKey && isValidated.accountName && isValidated.password && isValidated.repeatPassword;
}

export const ImportPrivateKey = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    focus('privateKey')();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _onImport = (formState: FormState) => {
    const privateKey = formState.data.privateKey;
    const accountName = formState.data.accountName;
    const password = formState.data.password;
    if (checkValidateForm(formState.isValidated)) {
      setIsBusy(true);
      createAccountSuriV2(accountName, password, privateKey.trim(), false, [EVM_ACCOUNT_TYPE])
        .then(() => {
          backToHome(navigation, true);
        })
        .catch(() => {
          setIsBusy(false);
        });
    } else {
      Keyboard.dismiss();
    }
  };

  const privateKeyFormConfig: FormControlConfig = {
    privateKey: {
      name: i18n.common.privateKey,
      value: '',
      require: true,
      transformFunc: value => {
        return value.trim();
      },
    },
    accountName: {
      name: i18n.common.accountName,
      value: '',
      require: true,
    },
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
  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(privateKeyFormConfig, {
    onSubmitForm: _onImport,
  });
  const validatePrivateKey = (currentPrivateKey: string) => {
    if (!currentPrivateKey) {
      return;
    }

    validateMetamaskPrivateKeyV2(currentPrivateKey.trim(), [EVM_ACCOUNT_TYPE])
      .then(({ autoAddPrefix }) => {
        let suri = `${currentPrivateKey || ''}`;
        if (autoAddPrefix) {
          suri = `0x${suri}`;
        }
        onChangeValue('privateKey')(suri);
        onUpdateErrors('privateKey')();
      })
      .catch(() => {
        onUpdateErrors('privateKey')([i18n.warningMessage.invalidEVMPrivateKey]);
      });
  };

  return (
    <SubScreenContainer title={i18n.title.importEVMPrivateKey} navigation={navigation}>
      <View style={{ flex: 1 }}>
        <ScrollView style={{ ...sharedStyles.layoutContainer }}>
          <Textarea
            placeholder={i18n.common.enterYourPrivateKey}
            placeholderTextColor={ColorMap.disabled}
            ref={formState.refs.privateKey}
            style={{ height: 94, marginBottom: 8, paddingTop: 16 }}
            onChangeText={onChangeValue('privateKey')}
            value={formState.data.privateKey}
            onBlur={() => validatePrivateKey(formState.data.privateKey)}
            onSubmitEditing={onSubmitField('privateKey')}
            errorMessages={formState.errors.privateKey}
          />

          <AccountNameAndPasswordArea
            formState={formState}
            onChangeValue={onChangeValue}
            onSubmitField={onSubmitField}
          />
        </ScrollView>

        <View style={footerAreaStyle}>
          <SubmitButton
            isBusy={isBusy}
            title={i18n.common.importAccount}
            onPress={() => _onImport(formState)}
            disabled={!checkValidateForm(formState.isValidated)}
          />
        </View>
      </View>
    </SubScreenContainer>
  );
};
