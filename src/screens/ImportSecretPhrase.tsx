import React, { useCallback, useEffect, useState } from 'react';
import { StyleProp, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { ColorMap } from 'styles/color';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { Textarea } from 'components/Textarea';
import { createAccountSuriV2, validateSeedV2 } from '../messaging';
import { SUBSTRATE_ACCOUNT_TYPE } from '../constant';
import { SubmitButton } from 'components/SubmitButton';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AccountNamePasswordCreation } from 'screens/Shared/AccountNamePasswordCreation';

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  paddingTop: 8,
};

const footerAreaStyle: StyleProp<any> = {
  paddingTop: 12,
  paddingBottom: 22,
};

const titleStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.disabled,
  textAlign: 'center',
  paddingHorizontal: 16,
  ...FontMedium,
  paddingBottom: 26,
};

export interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

const ViewStep = {
  ENTER_SEED: 1,
  ENTER_PASSWORD: 2,
};

export const ImportSecretPhrase = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [seed, setSeed] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.ENTER_SEED);
  const [isBusy, setBusy] = useState(false);

  useEffect(() => {
    if (!seed) {
      return;
    }

    const suri = `${seed || ''}`;

    validateSeedV2(seed, [SUBSTRATE_ACCOUNT_TYPE])
      .then(({ addressMap }) => {
        const address = addressMap[SUBSTRATE_ACCOUNT_TYPE];
        setAccount({ address, suri, genesis: '' });
      })
      .catch(() => {
        setAccount(null);
        setError('Invalid mnemonic seed');
      });
  }, [seed]);

  const _onImportSeed = useCallback(
    (curName: string, password: string): void => {
      if (curName && password && account) {
        setBusy(true);

        createAccountSuriV2(curName, password, account.suri, true, [SUBSTRATE_ACCOUNT_TYPE], '')
          .then(() => {
            navigation.navigate('Home');
          })
          .catch(() => {
            setBusy(false);
          });
      }
    },
    [account, navigation],
  );

  const onPressBack = () => {
    if (currentViewStep === ViewStep.ENTER_SEED) {
      navigation.goBack();
    } else {
      setCurrentViewStep(ViewStep.ENTER_SEED);
    }
  };

  console.log('error', error);
  console.log('seed', seed);

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} title={'Import Secret Phrase'}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 22 }}>
        {currentViewStep === ViewStep.ENTER_SEED && (
          <View style={{ flex: 1 }}>
            <View style={bodyAreaStyle}>
              <Text style={titleStyle}>
                Restore an existing wallet account with your 12 or 24-word secret recovery phrase
              </Text>

              <Textarea onChangeText={text => setSeed(text)} />
            </View>
            <View style={footerAreaStyle}>
              <SubmitButton
                disabled={!seed || !!error}
                isBusy={isBusy}
                title={'Continue'}
                onPress={() => {
                  setCurrentViewStep(ViewStep.ENTER_PASSWORD);
                }}
              />
            </View>
          </View>
        )}

        {currentViewStep === ViewStep.ENTER_PASSWORD && (
          <AccountNamePasswordCreation isBusy={isBusy} onCreateAccount={_onImportSeed} />
        )}
      </View>
    </ContainerWithSubHeader>
  );
};
