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

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginHorizontal: 16,
  ...MarginBottomForSubmitButton,
};

export const ImportPrivateKey = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [name, setName] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [autoCorrectPrivateKey, setAutoCorrectPrivateKey] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [pass1, setPass1] = useState<string | null>(null);
  const [pass2, setPass2] = useState<string | null>(null);
  const [pass2Dirty, setPass2Dirty] = useState<boolean>(false);
  const isSecondPasswordValid = !!(pass2 && pass2.length > 5) && pass2Dirty && pass1 !== pass2;

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
        createAccountSuriV2(name, password, autoCorrectPrivateKey, false, [EVM_ACCOUNT_TYPE])
          .then(() => {
            backToHome(navigation, true);
          })
          .catch(() => {
            setIsBusy(false);
          });
      }
    },
    [autoCorrectPrivateKey, name, navigation],
  );

  const onChangeName = (text: string) => {
    setName(text);
  };

  const onChangePass1 = (curPass1: string) => {
    if (curPass1 && curPass1.length) {
      setPass1(curPass1);
    } else {
      setPass1(null);
    }
  };

  const onChangePass2 = (curPass2: string) => {
    setPass2Dirty(true);
    if (curPass2 && curPass2.length) {
      setPass2(curPass2);
    } else {
      setPass2(null);
    }
  };

  return (
    <SubScreenContainer title={i18n.title.importEVMPrivateKey} navigation={navigation}>
      <View style={{ flex: 1 }}>
        <ScrollView style={{ ...sharedStyles.layoutContainer }}>
          <Textarea
            autoFocus={true}
            style={{ height: 94, marginBottom: 8, paddingTop: 16 }}
            onChangeText={onChangePrivateKey}
            value={autoCorrectPrivateKey || privateKey || ''}
            onBlur={validatePrivateKey}
          />

          {!!error && <Warning style={{ marginBottom: 8 }} message={error} isDanger />}

          <AccountNameAndPasswordArea
            autoFocusFirstField={false}
            name={name}
            pass1={pass1}
            pass2={pass2}
            pass2Dirty={pass2Dirty}
            onChangeName={onChangeName}
            onChangePass1={onChangePass1}
            onChangePass2={onChangePass2}
            isSecondPasswordValid={isSecondPasswordValid}
          />
        </ScrollView>

        <View style={footerAreaStyle}>
          <SubmitButton
            isBusy={isBusy}
            title={i18n.common.importAccount}
            onPress={() => _onImport(name, pass1 || '')}
            disabled={!pass1 || !pass2 || pass1 !== pass2 || !!error}
          />
        </View>
      </View>
    </SubScreenContainer>
  );
};
