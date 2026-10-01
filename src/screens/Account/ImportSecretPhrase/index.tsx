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
import { FileArrowDownIcon, WarningIcon, XIcon } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ImportSecretPhraseProps, RootNavigationProps } from 'routes/index';
import i18n from 'utils/i18n/i18n';
import createStyle from './styles';
import { AccountProxyType, ResponseMnemonicValidateV2 } from '@subwallet/extension-base/types';
import { AppModalContext } from 'providers/AppModalContext';
import { AccountNameModal } from 'components/Modal/AccountNameModal';
import { useToast } from 'react-native-toast-notifications';
import { DEFAULT_MNEMONIC_TYPE, TRUST_WALLET_MNEMONIC_TYPE } from 'constants/index';

// Trust Wallet only ever generates 12-word seed phrases. The extension enforces this through its
// phrase number selector, which mobile does not have, so the free-form textarea is guarded instead.
const TRUST_WALLET_PHRASE_NUMBER = 12;

const secretPhraseFormConfig: FormControlConfig = {
  seed: {
    name: '',
    value: '',
    require: true,
  },
};

export const ImportSecretPhrase = ({ route: { params } }: ImportSecretPhraseProps) => {
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
  const isTrustWallet = params?.mnemonicType === TRUST_WALLET_MNEMONIC_TYPE;
  const mnemonicType = isTrustWallet ? TRUST_WALLET_MNEMONIC_TYPE : DEFAULT_MNEMONIC_TYPE;
  useHandlerHardwareBackPress(accountCreating);

  const onSubmit = () => {
    if (seedValidationResponse && seedValidationResponse.mnemonicTypes === DEFAULT_MNEMONIC_TYPE) {
      confirmModal.setConfirmModal({
        visible: true,
        title: i18n.warningTitle.incompatibleSeedPhrase,
        message: (
          <>
            <Typography.Text>{`${i18n.warningMessage.unifiedSeedPhraseInfo}\n`}</Typography.Text>
            <Typography.Text>{i18n.warningMessage.tonIncompatibleSeedPhraseWarning}</Typography.Text>
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
        customIcon: <PageIcon icon={WarningIcon} color={theme.colorWarning} />,
        completeBtnTitle: i18n.buttonTitles.import,
      });
    } else if (seedValidationResponse && seedValidationResponse.mnemonicTypes === TRUST_WALLET_MNEMONIC_TYPE) {
      confirmModal.setConfirmModal({
        visible: true,
        title: i18n.warningTitle.trustSeedPhraseWarningTitle,
        message: (
          <>
            <Typography.Text>{`${i18n.warningMessage.trustSeedPhraseImportInfo}\n`}</Typography.Text>
            <Typography.Text>{i18n.warningMessage.trustSeedPhraseImportWarning}</Typography.Text>
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
        customIcon: <PageIcon icon={WarningIcon} color={theme.colorWarning} />,
        completeBtnTitle: i18n.buttonTitles.import,
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
          // The background accepts any valid BIP39 length for `trust-wallet`, so without this an
          // ed25519-tw account with no Trust Wallet counterpart could be created.
          if (isTrustWallet && trimSeed.split(/\s+/).length !== TRUST_WALLET_PHRASE_NUMBER) {
            if (amount) {
              setSeedValidationResponse(undefined);
              onUpdateErrors('seed')([i18n.errorMessage.trustWalletSeedPhraseWordCount]);
              setValidating(false);
            }

            return;
          }

          validateSeedV2({ mnemonic: trimSeed, mnemonicType })
            .then(response => {
              if (amount) {
                setSeedValidationResponse(response);
                onUpdateErrors('seed')([]);
              }
            })
            .catch((error: Error) => {
              if (amount) {
                onUpdateErrors('seed')([error.message]);
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
  }, [onUpdateErrors, formState.data.seed, mnemonicType, isTrustWallet]);

  const _onImportSeed = (accountName: string): void => {
    if (!seedValidationResponse) {
      return;
    }

    setAccountCreating(true);
    createAccountSuriV2({
      name: accountName,
      suri: seedValidationResponse.mnemonic,
      types: seedValidationResponse.pairTypes,
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
    return <Icon phosphorIcon={FileArrowDownIcon} size={'lg'} weight={'fill'} iconColor={iconColor} />;
  }, []);

  const disabled = useMemo(
    () => !formState.data.seed || !formState.isValidated.seed || accountCreating,
    [formState.data.seed, formState.isValidated.seed, accountCreating],
  );

  return (
    <ContainerWithSubHeader
      onPressBack={onPressBack}
      title={isTrustWallet ? i18n.header.importFromTrustWallet : i18n.header.importFromSeedPhrase}
      disabled={accountCreating}
      onPressRightIcon={goHome}
      rightIcon={XIcon}
      disableRightButton={accountCreating}>
      <View style={styles.wrapper}>
        <ScrollView style={styles.container}>
          <Typography.Text style={styles.title}>
            {isTrustWallet
              ? i18n.importAccount.importFromTrustWalletMessage
              : i18n.importAccount.importFromSeedPhraseMessage}
          </Typography.Text>
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
                ? seedValidationResponse.mnemonicTypes === DEFAULT_MNEMONIC_TYPE
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
