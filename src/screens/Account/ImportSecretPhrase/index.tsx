import { UnlockModal } from 'components/common/Modal/UnlockModal';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Textarea } from 'components/Textarea';
import { createAccountSuriV2, validateSeedV2 } from 'messaging/index';
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
import { Button, Icon, Typography } from 'components/design-system-ui';
import { FileArrowDown, X } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyle from './styles';

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
  const accountName = useGetDefaultAccountName();

  const timeOutRef = useRef<NodeJS.Timer>();

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [isBusy, setBusy] = useState(false);
  useHandlerHardwareBackPress(isBusy);

  const [seedPhrase, setSeedPhrase] = useState('');
  const [validating, setValidating] = useState(false);
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.ENTER_SEED);
  const [keyTypes, setKeyTypes] = useState<KeypairType[]>([SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE]);

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
  }, [seedPhrase, onUpdateErrors]);

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

  const { visible, onPasswordComplete, onPress: onPressSubmit, onHideModal } = useUnlockModal();

  return (
    <ContainerWithSubHeader
      onPressBack={onPressBack}
      title={i18n.title.importBySecretPhrase}
      disabled={isBusy}
      onPressRightIcon={goHome}
      rightIcon={X}>
      <View style={styles.wrapper}>
        <ScrollView style={styles.container}>
          <Typography.Text style={styles.title}>{i18n.common.importSecretPhraseTitle}</Typography.Text>
          <Textarea
            ref={formState.refs.seed}
            style={styles.textArea}
            value={formState.data.seed}
            onChangeText={(text: string) => {
              onChangeValue('seed')(text);
              setSeedPhrase(text);
            }}
            onSubmitEditing={onSubmitField('seed')}
            errorMessages={formState.errors.seed}
          />

          <SelectAccountType title={'Select account type'} selectedItems={keyTypes} setSelectedItems={setKeyTypes} />
        </ScrollView>
        <View style={styles.footer}>
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
            loading={validating || isBusy}
            onPress={onPressSubmit(_onImportSeed)}>
            {'Import account'}
          </Button>
        </View>
        <UnlockModal onPasswordComplete={onPasswordComplete} visible={visible} onHideModal={onHideModal} />
      </View>
    </ContainerWithSubHeader>
  );
};
