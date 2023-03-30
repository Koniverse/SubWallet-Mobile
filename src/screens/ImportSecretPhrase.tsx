import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import { FontMedium, MarginBottomForSubmitButton, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { Textarea } from 'components/Textarea';
import { createAccountSuriV2, keyringUnlock, validateSeedV2 } from '../messaging';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import i18n from 'utils/i18n/i18n';
import { KeypairType } from '@polkadot/util-crypto/types';
import { backToHome } from 'utils/navigation';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import { SelectAccountType } from 'components/common/SelectAccountType';
import useGetDefaultAccountName from 'hooks/useGetDefaultAccountName';
import { Button, Icon } from 'components/design-system-ui';
import { FileArrowDown } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

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

export const ImportSecretPhrase = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.ENTER_SEED);
  const [keyTypes, setKeyTypes] = useState<KeypairType[]>([SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE]);
  const [isBusy, setBusy] = useState(false);
  const accountName = useGetDefaultAccountName();
  useHandlerHardwareBackPress(isBusy);
  const hasMasterPassword = useSelector((state: RootState) => state.accountState.hasMasterPassword);
  console.log('hasMasterPassword', hasMasterPassword);

  // TODO: remove later
  useEffect(() => {
    keyringUnlock({
      password: '123123',
    }).catch((e: Error) => console.log(e));
  }, []);

  useEffect(() => {
    if (formState.data.seed) {
      setBusy(true);
      console.log('formState.data.seed', formState.data.seed);
      validateSeedV2(seedPhrase, [SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE])
        .then(() => setSeedPhrase(formState.data.seed))
        .catch(() => {
          onUpdateErrors('seed')([i18n.errorMessage.invalidMnemonicSeed]);
        })
        .finally(() => setBusy(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyTypes]);

  const _onImportSeed = (): void => {
    setBusy(true);
    createAccountSuriV2({
      name: accountName,
      suri: formState.data.seed,
      isAllowed: true,
      types: keyTypes,
    })
      .then(() => {
        backToHome(goHome);
      })
      .catch((e: Error) => {
        console.log('e', e);
        setBusy(false);
      });
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(secretPhraseFormConfig, {
    onSubmitForm: _onImportSeed,
  });
  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', () => {
      focus('seed')();
    });

    return unsubscribe;
  }, [focus, navigation]);

  const onPressBack = () => {
    if (currentViewStep === ViewStep.ENTER_SEED) {
      navigation.goBack();
    } else {
      setCurrentViewStep(ViewStep.ENTER_SEED);
    }
  };

  const disabled = useMemo(
    () => !formState.data.seed || !formState.isValidated.seed || isBusy,
    [formState.data.seed, formState.isValidated.seed, isBusy],
  );

  return (
    <ContainerWithSubHeader onPressBack={onPressBack} title={i18n.title.importBySecretPhrase} disabled={isBusy}>
      <View style={sharedStyles.layoutContainer}>
        <ScrollView style={bodyAreaStyle}>
          <Text style={titleStyle}>{i18n.common.importSecretPhraseTitle}</Text>

          <Textarea
            ref={formState.refs.seed}
            style={{ marginBottom: 16, paddingTop: 16 }}
            value={formState.data.seed}
            onChangeText={(text: string) => {
              onChangeValue('seed')(text);
            }}
            onBlur={() => setSeedPhrase(formState.data.seed)}
            onSubmitEditing={onSubmitField('seed')}
            errorMessages={formState.errors.seed}
          />

          <SelectAccountType title={'Select account type'} selectedItems={keyTypes} setSelectedItems={setKeyTypes} />
        </ScrollView>
        <View style={footerAreaStyle}>
          <Button
            icon={
              <Icon
                phosphorIcon={FileArrowDown}
                size={'lg'}
                weight={'fill'}
                iconColor={disabled ? theme.colorTextLight5 : theme.colorTextLight1}
              />
            }
            disabled={disabled}
            loading={isBusy}
            onPress={_onImportSeed}>
            {'Import account'}
          </Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
