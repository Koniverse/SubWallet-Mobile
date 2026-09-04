import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { BookIcon, ListChecksIcon, PlusCircleIcon, TrashIcon, XIcon } from 'phosphor-react-native';
import { AccountMultisigError } from '@subwallet/extension-base/background/KoniTypes';
import { AccountProxyType, AccountSignMode } from '@subwallet/extension-base/types';
import { reformatAddress } from '@subwallet/extension-base/utils';
import { isSubstrateAddress } from '@subwallet/keyring';
import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import { AccountProxyAvatar } from 'components/design-system-ui/avatar/account-proxy-avatar';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Button, Icon, PageIcon, Typography } from 'components/design-system-ui';
import InputText from 'components/Input/InputText';
import { AccountNameModal } from 'components/Modal/AccountNameModal';
import { AddSignerMultisigModal, SignerData } from 'components/Modal/AddressBook/AddSignerMultisigModal';
import useGoHome from 'hooks/screen/useGoHome';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { createAccountMultisig } from 'messaging/index';
import { useToast } from 'react-native-toast-notifications';
import { RootNavigationProps } from 'routes/index';
import { RootState } from 'stores/index';
import { FontMedium, FontSemiBold, MarginBottomForSubmitButton } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import { findAccountByAddress } from 'utils/account/account';
import i18n from 'utils/i18n/i18n';

const MIN_THRESHOLD = 2;

export const NewMultisigAccount = () => {
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const toast = useToast();

  const accounts = useSelector((state: RootState) => state.accountState.accounts);

  const [signers, setSigners] = useState<SignerData[]>([]);
  const [signerAddress, setSignerAddress] = useState('');
  const [signerAddressError, setSignerAddressError] = useState<string | undefined>();
  const [threshold, setThreshold] = useState('');
  const [loading, setLoading] = useState(false);
  const [signerModalVisible, setSignerModalVisible] = useState(false);
  const [accountNameModalVisible, setAccountNameModalVisible] = useState(false);

  const { onPress: onPressUnlock } = useUnlockModal(navigation);

  const signerAddresses = useMemo(() => signers.map(s => s.address), [signers]);

  const validateSignerAddress = useCallback(
    (value: string): string | undefined => {
      const trimmed = value.trim();

      if (!trimmed) {
        return undefined;
      }

      if (!isSubstrateAddress(trimmed)) {
        return i18n.multisig.invalidSignatoryAddress;
      }

      const formattedAddress = reformatAddress(trimmed);
      const accountInWallet = findAccountByAddress(accounts, formattedAddress);

      // Neither Ledger legacy nor Ledger ECDSA can produce a valid multisig signature.
      if (accountInWallet?.signMode === AccountSignMode.LEGACY_LEDGER) {
        return i18n.multisig.ledgerLegacyAccountNotSupported;
      }

      if (accountInWallet?.signMode === AccountSignMode.ECDSA_SUBSTRATE_LEDGER) {
        return i18n.multisig.ledgerEcdsaAccountNotSupported;
      }

      if (signers.some(item => item.address === formattedAddress)) {
        return i18n.multisig.addressAlreadyExistsInList;
      }

      return undefined;
    },
    [accounts, signers],
  );

  const onChangeSignerAddress = useCallback(
    (value: string) => {
      setSignerAddress(value);
      setSignerAddressError(validateSignerAddress(value));
    },
    [validateSignerAddress],
  );

  const isReadyAddSigner = useMemo(() => {
    return !!signerAddress.trim() && !signerAddressError;
  }, [signerAddress, signerAddressError]);

  const onAddManualSigner = useCallback(() => {
    const formattedAddress = reformatAddress(signerAddress.trim());
    const accountInWallet = findAccountByAddress(accounts, formattedAddress);

    setSigners(prev => [
      ...prev,
      {
        address: formattedAddress,
        proxyId: accountInWallet?.proxyId || formattedAddress,
        formatedAddress: formattedAddress,
        displayName: accountInWallet?.name || '',
      },
    ]);
    setSignerAddress('');
    setSignerAddressError(undefined);
    Keyboard.dismiss();
  }, [accounts, signerAddress]);

  const onConfirmSelectSigners = useCallback((selectedItems: SignerData[]) => {
    setSigners(prev => {
      const existingAddresses = prev.map(s => s.address);

      return [...prev, ...selectedItems.filter(item => !existingAddresses.includes(item.address))];
    });
  }, []);

  const onDeleteSigner = useCallback(
    (addressToDelete: string) => () => setSigners(prev => prev.filter(item => item.address !== addressToDelete)),
    [],
  );

  const thresholdError = useMemo((): string | undefined => {
    if (!signers.length) {
      return undefined;
    }

    if (!threshold) {
      return i18n.multisig.thresholdRequired;
    }

    const value = Number(threshold);

    if (!Number.isInteger(value) || value < MIN_THRESHOLD) {
      return i18n.multisig.thresholdGreaterThanOne;
    }

    if (value > signers.length) {
      return i18n.multisig.thresholdExceedsSigners;
    }

    return undefined;
  }, [signers.length, threshold]);

  const isValidThreshold = !!signers.length && !!threshold && !thresholdError;

  const onConfirmSignatory = useCallback(() => {
    // The backend derives the same address from the same (signers, threshold) pair, so
    // catch the duplicate here instead of failing after the name has been entered.
    const existingMultisigAccount = accounts.find(account => {
      if (!account.isMultisig) {
        return false;
      }

      const accountSignerSet = new Set(account.signers || []);

      if (accountSignerSet.size !== signerAddresses.length) {
        return false;
      }

      for (const signer of signerAddresses) {
        if (!accountSignerSet.has(signer)) {
          return false;
        }
      }

      return account.threshold === parseInt(threshold, 10);
    });

    if (existingMultisigAccount) {
      toast.show(i18n.multisig.multisigAccountAlreadyExists, { type: 'danger' });

      return;
    }

    setAccountNameModalVisible(true);
  }, [accounts, signerAddresses, threshold, toast]);

  const onSubmit = useCallback(
    (accountName: string) => {
      setLoading(true);

      createAccountMultisig({
        signers: signerAddresses,
        threshold: parseInt(threshold, 10),
        name: accountName,
      })
        .then((errors: AccountMultisigError[]) => {
          if (errors?.length) {
            toast.show(errors[0].message, { type: 'danger' });

            return;
          }

          setAccountNameModalVisible(false);
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        })
        .catch((error: Error) => {
          toast.show(error.message, { type: 'danger' });
        })
        .finally(() => setLoading(false));
    },
    [navigation, signerAddresses, threshold, toast],
  );

  // Threshold only makes sense once there is at least one signatory.
  useEffect(() => {
    if (!signers.length) {
      setThreshold('');
    }
  }, [signers.length]);

  return (
    <ContainerWithSubHeader
      onPressBack={() => navigation.goBack()}
      title={i18n.multisig.createMultisigAccount}
      rightIcon={XIcon}
      onPressRightIcon={goHome}>
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps={'handled'}>
          <Typography.Text style={styles.sectionLabel}>{i18n.multisig.addSignatory}</Typography.Text>

          <View style={styles.signerInputRow}>
            <View style={styles.signerInputWrapper}>
              <InputText
                value={signerAddress}
                onChangeText={onChangeSignerAddress}
                placeholder={i18n.multisig.enterAddress}
                errorMessages={signerAddressError ? [signerAddressError] : undefined}
                extraTextInputStyle={styles.addressTextInput}
                rightIcon={
                  <>
                    <View style={styles.inputPrefix} pointerEvents={'none'}>
                      <AccountProxyAvatar size={24} value={signerAddress} />
                    </View>
                    <View style={styles.inputSuffix}>
                      <Button
                        type={'ghost'}
                        size={'xs'}
                        icon={<Icon phosphorIcon={BookIcon} size={'sm'} iconColor={theme['gray-5']} />}
                        onPress={() => setSignerModalVisible(true)}
                      />
                    </View>
                  </>
                }
              />
            </View>
            <Button
              disabled={!isReadyAddSigner}
              type={'secondary'}
              size={'sm'}
              icon={
                <Icon
                  phosphorIcon={PlusCircleIcon}
                  weight={'fill'}
                  customSize={28}
                  iconColor={isReadyAddSigner ? theme.colorTextLight1 : theme.colorTextLight5}
                />
              }
              onPress={onAddManualSigner}
            />
          </View>

          {!signers.length ? (
            <View style={styles.emptyCard}>
              <PageIcon icon={ListChecksIcon} color={theme.colorTextTertiary} backgroundColor={'rgba(77, 77, 77, 0.1)'} />
              <Typography.Text style={styles.emptyTitle}>{i18n.multisig.signatoryList}</Typography.Text>
              <Typography.Text style={styles.emptyMessage}>{i18n.multisig.selectSignatoriesToCreate}</Typography.Text>
            </View>
          ) : (
            <>
              <Typography.Text style={styles.sectionLabel}>{i18n.multisig.signatories}</Typography.Text>
              <View style={styles.signerList}>
                {signers.map(signer => (
                  <AccountItemWithName
                    key={signer.address}
                    address={signer.formatedAddress}
                    avatarValue={signer.proxyId}
                    accountName={signer.displayName}
                    avatarSize={theme.sizeLG}
                    rightItem={
                      <Button
                        type={'ghost'}
                        size={'xs'}
                        icon={<Icon phosphorIcon={TrashIcon} size={'sm'} iconColor={theme.colorError} />}
                        onPress={onDeleteSigner(signer.address)}
                      />
                    }
                  />
                ))}
              </View>

              <Typography.Text style={styles.sectionLabel}>{i18n.multisig.setApprovalThreshold}</Typography.Text>
              <InputText
                value={threshold}
                onChangeText={value => setThreshold(value.replace(/\D/g, ''))}
                placeholder={i18n.multisig.enterThreshold}
                keyboardType={'number-pad'}
                errorMessages={thresholdError ? [thresholdError] : undefined}
                extraTextInputStyle={styles.thresholdTextInput}
                rightIcon={
                  <View style={styles.inputSuffixText} pointerEvents={'none'}>
                    <Typography.Text style={styles.thresholdHint}>{`/ ${signers.length}`}</Typography.Text>
                  </View>
                }
              />
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button disabled={!isValidThreshold} onPress={onPressUnlock(onConfirmSignatory)}>
            {i18n.multisig.continue}
          </Button>
        </View>
      </View>

      <AddSignerMultisigModal
        modalVisible={signerModalVisible}
        setModalVisible={setSignerModalVisible}
        selectedSigners={signers}
        onConfirm={onConfirmSelectSigners}
      />

      <AccountNameModal
        accountType={AccountProxyType.MULTISIG}
        isLoading={loading}
        modalVisible={accountNameModalVisible}
        setModalVisible={setAccountNameModalVisible}
        onSubmit={onSubmit}
      />
    </ContainerWithSubHeader>
  );
};

function createStyles(theme: ThemeTypes) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: theme.padding,
      paddingTop: theme.padding,
    },
    sectionLabel: {
      ...FontSemiBold,
      color: theme.colorTextLight1,
      fontSize: theme.fontSizeSM,
      textTransform: 'uppercase',
      marginBottom: theme.marginSM,
    },
    signerInputRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.sizeXS,
    },
    signerInputWrapper: {
      flex: 1,
    },
    // The TextInput fills the field and carries zIndex 1, so both adornments have to
    // sit above it and the text has to be padded clear of them.
    inputPrefix: {
      position: 'absolute',
      left: theme.paddingSM,
      top: 12,
      zIndex: 2,
    },
    inputSuffix: {
      position: 'absolute',
      right: theme.paddingXXS,
      top: 6,
      zIndex: 2,
    },
    inputSuffixText: {
      position: 'absolute',
      right: theme.paddingSM,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      zIndex: 2,
    },
    addressTextInput: {
      paddingLeft: theme.paddingSM + 32,
      paddingRight: 44,
    },
    thresholdTextInput: {
      paddingRight: 44,
    },
    emptyCard: {
      backgroundColor: theme.colorBgSecondary,
      borderRadius: theme.borderRadiusLG,
      alignItems: 'center',
      padding: theme.padding,
      paddingVertical: theme.paddingXL,
      marginBottom: theme.marginSM,
    },
    emptyTitle: {
      ...FontSemiBold,
      fontSize: theme.fontSizeLG,
      lineHeight: theme.fontSizeLG * theme.lineHeightLG,
      color: theme.colorTextLight2,
      paddingTop: theme.padding,
    },
    emptyMessage: {
      ...FontMedium,
      color: theme.colorTextLight4,
      textAlign: 'center',
    },
    signerList: {
      gap: theme.sizeXS,
      marginBottom: theme.margin,
    },
    thresholdHint: {
      ...FontMedium,
      color: theme.colorTextTertiary,
    },
    footer: {
      paddingHorizontal: theme.padding,
      paddingTop: theme.padding,
      ...MarginBottomForSubmitButton,
    },
  });
}

export default NewMultisigAccount;
