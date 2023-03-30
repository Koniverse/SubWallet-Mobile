import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ColorMap } from 'styles/color';
import { FontMedium, MarginBottomForSubmitButton, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { Textarea } from 'components/Textarea';
import { createAccountSuriV2, validateSeedV2 } from '../messaging';
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

const ViewStep = {
  ENTER_SEED: 1,
  ENTER_PASSWORD: 2,
};

const secretPhraseFormConfig: FormControlConfig = {
  seed: {
    name: '',
    value: '',
    require: true,
  },
};

export const ImportSecretPhrase = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [validating, setValidating] = useState(false);
  const [changed, setChanged] = useState(false);
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.ENTER_SEED);
  const [keyTypes, setKeyTypes] = useState<KeypairType[]>([SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE]);
  const [isBusy, setBusy] = useState(false);
  const accountName = useGetDefaultAccountName();
  useHandlerHardwareBackPress(isBusy);
  const timeOutRef = useRef<NodeJS.Timer>();

  const _onImportSeed = (): void => {
    setBusy(true);
    createAccountSuriV2({
      name: accountName,
      suri: seedPhrase,
      isAllowed: true,
      types: keyTypes,
    })
      .then(() => {
        backToHome(goHome);
      })
      .catch(() => {
        setBusy(false);
      });
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(secretPhraseFormConfig, {
    onSubmitForm: _onImportSeed,
  });

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }

    if (amount) {
      if (seedPhrase) {
        setValidating(true);
        onUpdateErrors('seed')([]);

        timeOutRef.current = setTimeout(() => {
          validateSeedV2(seedPhrase, [SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE])
            .then(() => {
              if (amount) {
                onUpdateErrors('seed')([]);
              }
            })
            .catch(() => {
              if (amount) {
                onUpdateErrors('seed')([i18n.errorMessage.invalidMnemonicSeed]);
              }
            })
            .finally(() => {
              if (amount) {
                setValidating(false);
              }
            });
        }, 300);
      }
    }

    return () => {
      amount = false;
    };
  }, [seedPhrase, changed, onUpdateErrors]);

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
              setChanged(true);
              onChangeValue('seed')(text);
              setSeedPhrase(text);
            }}
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
            disabled={disabled || validating}
            loading={validating}
            onPress={_onImportSeed}>
            {'Import account'}
          </Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
