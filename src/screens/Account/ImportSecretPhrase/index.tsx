import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
import { Textarea } from 'components/Textarea';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { createAccountSuriV2, validateSeedV2 } from 'messaging/index';
import { FileArrowDown, Warning, X } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';
import { AccountProxyType, ResponseMnemonicValidateV2 } from '@subwallet/extension-base/types';
import { AppModalContext } from 'providers/AppModalContext';
import { AccountNameModal } from 'components/Modal/AccountNameModal';
import { useToast } from 'react-native-toast-notifications';
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
  const { confirmModal } = useContext(AppModalContext);
  const { onPress: onPressSubmit } = useUnlockModal(navigation);
  const toast = useToast();
  const timeOutRef = useRef<NodeJS.Timeout>();
  const styles = useMemo(() => createStyle(theme), [theme]);
  const [accountNameModalVisible, setAccountNameModalVisible] = useState<boolean>(false);
  const [seedValidationResponse, setSeedValidationResponse] = useState<undefined | ResponseMnemonicValidateV2>();
  const [accountCreating, setAccountCreating] = useState(false);
  const [validating, setValidating] = useState(false);
  useHandlerHardwareBackPress(accountCreating);

  const onSubmit = () => {
    if (seedValidationResponse && seedValidationResponse.mnemonicTypes === 'general') {
      confirmModal.setConfirmModal({
        visible: true,
        title: 'Incompatible seed phrase',
        message: (
          <>
            <Typography.Text>
              {
                'This seed phrase generates a unified account that can be used on multiple ecosystems in SubWallet including TON. \n'
              }
            </Typography.Text>
            <Typography.Text>
              Note that you can’t import this seed phrase into TON-native wallets as this seed phrase is incompatible
              with TON-native wallets.
            </Typography.Text>
          </>
        ),
        onCancelModal: () => {
          confirmModal.hideConfirmModal();
          setAccountCreating(false);
        },
        onCompleteModal: () => {
          confirmModal.hideConfirmModal();
          setAccountNameModalVisible(true);
        },
        customIcon: <PageIcon icon={Warning} color={theme.colorWarning} />,
        completeBtnTitle: 'Import',
      });
    } else {
      setAccountNameModalVisible(true);
    }
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(secretPhraseFormConfig, {
    onSubmitForm: onPressSubmit(onSubmit),
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
          validateSeedV2(trimSeed)
            .then(response => {
              if (amount) {
                setSeedValidationResponse(response);
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

  const _onImportSeed = (accountName: string): void => {
    if (!seedValidationResponse) {
      return;
    }

    setAccountCreating(true);
    createAccountSuriV2({
      name: accountName,
      suri: seedValidationResponse.mnemonic,
      type: seedValidationResponse.mnemonicTypes === 'ton' ? 'ton-native' : undefined,
      isAllowed: true,
    })
      .then(() => {
        setAccountNameModalVisible(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      })
      .catch((e: Error) => {
        toast.hideAll();
        toast.show(e.message, { type: 'danger' });
        setAccountCreating(false);
      });
  };

  useEffect(() => {
    return navigation.addListener('transitionEnd', () => {
      focus('seed')();
    });
  }, [focus, navigation]);

  const onPressBack = () => {
    navigation.goBack();
  };

  const renderIconButton = useCallback((iconColor: string) => {
    return <Icon phosphorIcon={FileArrowDown} size={'lg'} weight={'fill'} iconColor={iconColor} />;
  }, []);

  const disabled = useMemo(
    () => !formState.data.seed || !formState.isValidated.seed || accountCreating,
    [formState.data.seed, formState.isValidated.seed, accountCreating],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={onPressBack}
      title={i18n.header.importFromSeedPhrase}
      disabled={accountCreating}
      onPressRightIcon={goHome}
      rightIcon={X}
      disableRightButton={accountCreating}>
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
            editable={!accountCreating}
            onSubmitEditing={onSubmitField('seed')}
            errorMessages={formState.errors.seed}
            placeholderTextColor={theme.colorTextTertiary}
            placeholder={i18n.placeholder.seedPhrase}
            autoCapitalize="none"
          />
        </ScrollView>
        <View style={styles.footer}>
          <Button
            icon={renderIconButton}
            disabled={disabled || validating}
            loading={validating || accountCreating}
            onPress={onPressSubmit(onSubmit)}>
            {i18n.buttonTitles.importAccount}
          </Button>
        </View>

        {accountNameModalVisible && (
          <AccountNameModal
            modalVisible={accountNameModalVisible}
            setModalVisible={setAccountNameModalVisible}
            accountType={
              seedValidationResponse
                ? seedValidationResponse.mnemonicTypes === 'general'
                  ? AccountProxyType.UNIFIED
                  : AccountProxyType.SOLO
                : undefined
            }
            isLoading={accountCreating}
            onSubmit={_onImportSeed}
          />
        )}
      </View>
    </ContainerWithSubHeader>
  );
};
