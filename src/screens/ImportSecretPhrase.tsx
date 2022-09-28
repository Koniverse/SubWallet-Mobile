import React, { useEffect, useState } from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { useNavigation } from '@react-navigation/native';
import { ImportSecretPhraseProps, RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import { FontMedium, MarginBottomForSubmitButton, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { Textarea } from 'components/Textarea';
import { createAccountSuriV2, validateSeedV2 } from '../messaging';
import { SubmitButton } from 'components/SubmitButton';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AccountNamePasswordCreation } from 'screens/Shared/AccountNamePasswordCreation';
import i18n from 'utils/i18n/i18n';
import { KeypairType } from '@polkadot/util-crypto/types';
import { backToHome } from 'utils/navigation';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';

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

const secretPhraseFormConfig: FormControlConfig = {
  seed: {
    name: '',
    value: '',
    require: true,
    // transformFunc: value => {
    //   return value.trim();
    // },
  },
};
export const ImportSecretPhrase = ({
  route: {
    params: { keyTypes },
  },
}: ImportSecretPhraseProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.ENTER_SEED);
  const [isBusy, setBusy] = useState(false);
  const validateSeedAndGoToNextScreen = (currentFormState: FormState) => {
    const seed = currentFormState.data.seed.trim();
    if (!seed) {
      return;
    }
    onChangeValue('seed')(seed);
    const suri = `${seed || ''}`;
    setBusy(true);
    validateSeedV2(seed, [keyTypes])
      .then(({ addressMap }) => {
        const address = addressMap[keyTypes as KeypairType];
        setAccount({ address, suri, genesis: '' });
        onUpdateErrors('seed')();
        setCurrentViewStep(ViewStep.ENTER_PASSWORD);
      })
      .catch(() => {
        setAccount(null);
        onUpdateErrors('seed')([i18n.errorMessage.invalidMnemonicSeed]);
      })
      .finally(() => setBusy(false));
  };

  useEffect(() => {
    focus('seed')();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(secretPhraseFormConfig, {
    onSubmitForm: validateSeedAndGoToNextScreen,
  });

  const _onImportSeed = (curName: string, password: string): void => {
    if (curName && password && account) {
      setBusy(true);
      createAccountSuriV2(curName, password, account.suri, true, [keyTypes], '')
        .then(() => {
          backToHome(navigation, true);
        })
        .catch(() => {
          setBusy(false);
        });
    }
  };

  const onPressBack = () => {
    if (currentViewStep === ViewStep.ENTER_SEED) {
      navigation.goBack();
    } else {
      setCurrentViewStep(ViewStep.ENTER_SEED);
    }
  };

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} title={i18n.title.importSecretPhrase} disabled={isBusy}>
      <>
        {currentViewStep === ViewStep.ENTER_SEED && (
          <View style={sharedStyles.layoutContainer}>
            <ScrollView style={bodyAreaStyle}>
              <Text style={titleStyle}>{i18n.common.importSecretPhraseTitle}</Text>

              <Textarea
                ref={formState.refs.seed}
                style={{ marginBottom: 8, paddingTop: 16 }}
                value={formState.data.seed}
                autoFocus={true}
                onChangeText={onChangeValue('seed')}
                onSubmitEditing={onSubmitField('seed')}
                errorMessages={formState.errors.seed}
              />
            </ScrollView>
            <View style={footerAreaStyle}>
              <SubmitButton
                disabled={!formState.data.seed || !formState.isValidated.seed || isBusy}
                isBusy={isBusy}
                title={i18n.common.continue}
                onPress={() => validateSeedAndGoToNextScreen(formState)}
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
