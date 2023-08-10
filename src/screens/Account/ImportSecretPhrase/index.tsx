import { KeypairType } from '@polkadot/util-crypto/types';
import { useNavigation } from '@react-navigation/native';
import { SelectAccountType } from 'components/common/SelectAccountType';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { Textarea } from 'components/Textarea';
import { EVM_ACCOUNT_TYPE, SUBSTRATE_ACCOUNT_TYPE } from 'constants/index';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import useGetDefaultAccountName from 'hooks/useGetDefaultAccountName';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { createAccountSuriV2, validateSeedV2 } from 'messaging/index';
import { FileArrowDown, X } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import { backToHome } from 'utils/navigation';
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
  const { onPress: onPressSubmit } = useUnlockModal(navigation);

  const timeOutRef = useRef<NodeJS.Timer>();

  const styles = useMemo(() => createStyle(theme), [theme]);

  const [isBusy, setBusy] = useState(false);
  useHandlerHardwareBackPress(isBusy);

  const [validating, setValidating] = useState(false);
  const [currentViewStep, setCurrentViewStep] = useState<number>(ViewStep.ENTER_SEED);
  const [keyTypes, setKeyTypes] = useState<KeypairType[]>([SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE]);

  const _onImportSeed = (): void => {
    setBusy(true);
    createAccountSuriV2({
      name: accountName,
      suri: formState.data.seed.trim(),
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
    onSubmitForm: onPressSubmit(_onImportSeed),
  });

  useEffect(() => {
    let amount = true;

    if (timeOutRef.current) {
      clearTimeout(timeOutRef.current);
    }

    if (amount) {
      const trimSeed = formState.data.seed.trim();

      if (trimSeed) {
        setValidating(true);
        onUpdateErrors('seed')([]);

        timeOutRef.current = setTimeout(() => {
          validateSeedV2(trimSeed, [SUBSTRATE_ACCOUNT_TYPE, EVM_ACCOUNT_TYPE])
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
  }, [onUpdateErrors, formState.data.seed]);

  useEffect(() => {
    return navigation.addListener('transitionEnd', () => {
      focus('seed')();
    });
  }, [focus, navigation]);

  const onPressBack = () => {
    if (currentViewStep === ViewStep.ENTER_SEED) {
      navigation.goBack();
    } else {
      setCurrentViewStep(ViewStep.ENTER_SEED);
    }
  };

  const renderIconButton = useCallback((iconColor: string) => {
    return <Icon phosphorIcon={FileArrowDown} size={'lg'} weight={'fill'} iconColor={iconColor} />;
  }, []);

  const disabled = useMemo(
    () => !formState.data.seed || !formState.isValidated.seed || isBusy,
    [formState.data.seed, formState.isValidated.seed, isBusy],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={onPressBack}
      title={i18n.header.importFromSeedPhrase}
      disabled={isBusy}
      onPressRightIcon={goHome}
      rightIcon={X}
      disableRightButton={isBusy}>
      <View style={styles.wrapper}>
        <ScrollView style={styles.container}>
          <Typography.Text style={styles.title}>{i18n.importAccount.importFromSeedPhraseMessage}</Typography.Text>
          <Textarea
            ref={formState.refs.seed}
            style={styles.textArea}
            value={formState.data.seed}
            onChangeText={(text: string) => {
              onChangeValue('seed')(text);
            }}
            editable={!isBusy}
            onSubmitEditing={onSubmitField('seed')}
            errorMessages={formState.errors.seed}
            placeholderTextColor={theme.colorTextTertiary}
            placeholder={i18n.placeholder.seedPhrase}
            autoCapitalize="none"
          />

          <SelectAccountType
            title={i18n.importAccount.selectAccountType}
            selectedItems={keyTypes}
            setSelectedItems={setKeyTypes}
            disabled={isBusy}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            icon={renderIconButton}
            disabled={disabled || validating || !keyTypes.length}
            loading={validating || isBusy}
            onPress={onPressSubmit(_onImportSeed)}>
            {i18n.buttonTitles.importAccount}
          </Button>
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
