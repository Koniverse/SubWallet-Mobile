import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { useNavigation } from '@react-navigation/native';
import { ImportSecretPhraseProps, RootNavigationProps } from 'types/routes';
import { ColorMap } from 'styles/color';
import { FontMedium, MarginBottomForSubmitButton, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { Textarea } from 'components/Textarea';
import { createAccountSuriV2, validateSeedV2 } from '../messaging';
import { SubmitButton } from 'components/SubmitButton';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AccountNamePasswordCreation } from 'screens/Shared/AccountNamePasswordCreation';
import i18n from 'utils/i18n/i18n';
import { KeypairType } from '@polkadot/util-crypto/types';

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  ...ScrollViewStyle,
};

const footerAreaStyle: StyleProp<any> = {
  paddingTop: 12,
  ...MarginBottomForSubmitButton,
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

export const ImportSecretPhrase = ({
  route: {
    params: { keyTypes },
  },
}: ImportSecretPhraseProps) => {
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

    validateSeedV2(seed, [keyTypes])
      .then(({ addressMap }) => {
        const address = addressMap[keyTypes as KeypairType];
        setAccount({ address, suri, genesis: '' });
        setError('');
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch(e => {
        setAccount(null);
        setError('Invalid mnemonic seed');
      });
  }, [keyTypes, seed]);

  const _onImportSeed = useCallback(
    (curName: string, password: string): void => {
      if (curName && password && account) {
        setBusy(true);

        createAccountSuriV2(curName, password, account.suri, true, [keyTypes], '')
          .then(() => {
            navigation.navigate('Home');
          })
          .catch(() => {
            setBusy(false);
          });
      }
    },
    [account, keyTypes, navigation],
  );

  const onPressBack = () => {
    if (currentViewStep === ViewStep.ENTER_SEED) {
      navigation.goBack();
    } else {
      setCurrentViewStep(ViewStep.ENTER_SEED);
    }
  };

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} title={i18n.title.importSecretPhrase}>
      <>
        {currentViewStep === ViewStep.ENTER_SEED && (
          <View style={sharedStyles.layoutContainer}>
            <ScrollView style={bodyAreaStyle}>
              <Text style={titleStyle}>
                Restore an existing wallet account with your 12 or 24-word secret recovery phrase
              </Text>

              <Textarea
                autoFocus={true}
                onChangeText={text => {
                  setSeed(text);
                }}
              />
            </ScrollView>
            <View style={footerAreaStyle}>
              <SubmitButton
                disabled={!seed || !!error}
                isBusy={isBusy}
                title={i18n.common.continue}
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
      </>
    </ContainerWithSubHeader>
  );
};
