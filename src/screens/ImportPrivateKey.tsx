import React, { useCallback, useState } from 'react';
import { SubScreenContainer } from 'components/SubScreenContainer';
import i18n from 'utils/i18n/i18n';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { ScrollView, StyleProp, View } from 'react-native';
import { MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { SubmitButton } from 'components/SubmitButton';
import { AccountNameAndPasswordArea } from 'components/AccountNameAndPasswordArea';
import { createAccountSuriV2, validateMetamaskPrivateKeyV2 } from '../messaging';
import { Textarea } from 'components/Textarea';
import { Warning } from 'components/Warning';
import { EVM_ACCOUNT_TYPE } from '../constant';
import { backToHome } from 'utils/navigation';
import useFormControl from 'hooks/screen/useFormControl';
import { formConfig } from 'screens/Shared/AccountNamePasswordCreation';

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginHorizontal: 16,
  ...MarginBottomForSubmitButton,
};

const privateKeyFormConfig = Object.assign({
  privateKey: {
    name: i18n.common.privateKey,
    value: '',
  },
  ...formConfig,
});

export const ImportPrivateKey = () => {
  const { formState, onChangeValue, onSubmitEditing } = useFormControl(privateKeyFormConfig);
  const navigation = useNavigation<RootNavigationProps>();
  const [privateKey, setPrivateKey] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [autoCorrectPrivateKey, setAutoCorrectPrivateKey] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);

  const onChangePrivateKey = (text: string) => {
    setAutoCorrectPrivateKey('');
    setPrivateKey(text);

    if (error) {
      setError('');
    }
  };

  const validatePrivateKey = useCallback(() => {
    if (!privateKey) {
      return;
    }

    validateMetamaskPrivateKeyV2(privateKey, [EVM_ACCOUNT_TYPE])
      .then(({ autoAddPrefix }) => {
        let suri = `${privateKey || ''}`;
        if (autoAddPrefix) {
          suri = `0x${suri}`;
        }
        setAutoCorrectPrivateKey(suri);
        setError('');
      })
      .catch(() => {
        setError(i18n.warningMessage.notAValidEVMPrivateKey);
      });
  }, [privateKey]);

  const _onImport = useCallback(
    (accountName: string, password: string): void => {
      if (accountName && password) {
        setIsBusy(true);
        createAccountSuriV2(accountName, password, autoCorrectPrivateKey, false, [EVM_ACCOUNT_TYPE])
          .then(() => {
            backToHome(navigation, true);
          })
          .catch(() => {
            setIsBusy(false);
          });
      }
    },
    [autoCorrectPrivateKey, navigation],
  );

  return (
    <SubScreenContainer title={i18n.title.importEVMPrivateKey} navigation={navigation}>
      <View style={{ flex: 1 }}>
        <ScrollView style={{ ...sharedStyles.layoutContainer }}>
          <Textarea
            ref={formState.refs.privateKey}
            autoFocus={true}
            style={{ height: 94, marginBottom: 8, paddingTop: 16 }}
            onChangeText={onChangePrivateKey}
            value={autoCorrectPrivateKey || privateKey || ''}
            onBlur={validatePrivateKey}
            onSubmitEditing={onSubmitEditing('privateKey')}
          />

          {!!error && <Warning style={{ marginBottom: 8 }} message={error} isDanger />}

          <AccountNameAndPasswordArea
            formState={formState}
            onChangeValue={onChangeValue}
            onSubmitEditing={onSubmitEditing}
          />
        </ScrollView>

        <View style={footerAreaStyle}>
          <SubmitButton
            isBusy={isBusy}
            title={i18n.common.importAccount}
            onPress={() => _onImport(formState.data.accountName, formState.data.password)}
            disabled={
              !!error ||
              !formState.isValidated.accountName ||
              !formState.isValidated.password ||
              !formState.isValidated.repeatPassword
            }
          />
        </View>
      </View>
    </SubScreenContainer>
  );
};
