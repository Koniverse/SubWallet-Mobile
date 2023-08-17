import useConfirmModal from 'hooks/modal/useConfirmModal';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { ScrollView, View } from 'react-native';
import { Avatar, Button, Icon } from 'components/design-system-ui';
import { ArrowCircleRight, CheckCircle, Info, Trash } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ApplyMasterPasswordStyle from './style';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { AddressField } from 'components/Field/Address';
import { TextField } from 'components/Field/Text';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { PasswordField } from 'components/Field/Password';
import { forgetAccount, keyringMigrateMasterPassword } from 'messaging/index';
import { Introduction } from 'screens/MasterPassword/ApplyMasterPassword/Introduction';
import { ApplyDone } from 'screens/MasterPassword/ApplyMasterPassword/ApplyDone';
import useGoHome from 'hooks/screen/useGoHome';
import i18n from 'utils/i18n/i18n';
import DeleteModal from 'components/common/Modal/DeleteModal';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { SelectedActionType } from 'stores/types';
import { noop } from 'utils/function';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

type PageStep = 'Introduction' | 'Migrate' | 'Done';

const finishIcon = <Icon phosphorIcon={CheckCircle} size={'lg'} weight="fill" />;

const removeIcon = <Icon phosphorIcon={Trash} size={'lg'} iconColor={'#737373'} />;

const nextIcon = <Icon phosphorIcon={ArrowCircleRight} size={'lg'} weight={'fill'} />;

const intersectionArray = (array1: AccountJson[], array2: AccountJson[]): AccountJson[] => {
  return array1.filter(account => array2.find(acc => acc.address === account.address));
};

const ApplyMasterPassword = () => {
  const theme = useSubWalletTheme().swThemes;
  const goHome = useGoHome();
  const _style = ApplyMasterPasswordStyle(theme);
  const { accounts, isLocked } = useSelector((state: RootState) => state.accountState);
  const [step, setStep] = useState<PageStep>('Introduction');
  const [migrateAccount, setMigrateAccount] = useState<AccountJson | undefined>(undefined);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isDisabled, setIsDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const selectedAction = useRef<SelectedActionType>();
  const navigation = useNavigation<RootNavigationProps>();
  useHandlerHardwareBackPress(true);
  const migrateAddressRef = useRef<string>('');
  const formConfig: FormControlConfig = {
    password: {
      name: i18n.inputLabel.currentPassword,
      value: '',
      validateFunc: validatePassword,
    },
  };
  const isFocused = useIsFocused();
  const { onPress, onHideModal } = useUnlockModal(navigation);

  useEffect(() => {
    if (isFocused) {
      onHideModal();
    }
  }, [isFocused, onHideModal]);

  const migratedRef = useRef<AccountJson[]>(
    accounts.filter(acc => acc.address !== ALL_ACCOUNT_KEY && !acc.isExternal && acc.isMasterPassword),
  );

  const migrated = useMemo(() => {
    const oldVal = migratedRef.current;
    const newVal = accounts.filter(acc => acc.address !== ALL_ACCOUNT_KEY && !acc.isExternal && acc.isMasterPassword);
    const result = intersectionArray(oldVal, newVal);

    migratedRef.current = result;

    return result;
  }, [accounts]);

  const canMigrate = useMemo(
    () =>
      accounts
        .filter(acc => acc.address !== ALL_ACCOUNT_KEY && !acc.isExternal)
        .filter(acc => !migrated.find(item => item.address === acc.address)),
    [accounts, migrated],
  );

  const needMigrate = useMemo(() => {
    return canMigrate.filter(acc => !acc.isMasterPassword);
  }, [canMigrate]);

  const onSubmit = useCallback(
    (formState: FormState) => {
      const password = formState.data.password;
      const address = migrateAddressRef.current;
      if (address && password) {
        setLoading(true);
        setTimeout(() => {
          keyringMigrateMasterPassword({
            address: address,
            password: password,
          })
            .then(res => {
              if (!res.status) {
                onUpdateErrors('password')([res.errors[0]]);
                setIsError(true);
              } else {
                setIsError(false);
                onUpdateErrors('password')(undefined);
              }
            })
            .catch((e: Error) => {
              setIsError(true);
              onUpdateErrors('password')([e.message]);
            })
            .finally(() => {
              setLoading(false);
            });
        }, 500);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  useEffect(() => {
    migrateAddressRef.current = migrateAccount?.address || '';
  }, [migrateAccount?.address]);

  useEffect(() => {
    if (isLocked) {
      setStep('Introduction');
    }
  }, [isLocked]);

  useEffect(() => {
    onUpdateErrors('password')(undefined);
    setStep(prevState => {
      if (prevState !== 'Introduction') {
        return needMigrate.length ? 'Migrate' : 'Done';
      } else {
        return 'Introduction';
      }
    });
  }, [needMigrate.length, onUpdateErrors]);

  useEffect(() => {
    if (step === 'Migrate') {
      setMigrateAccount(prevState => {
        if (deleting) {
          return prevState;
        }

        if (!prevState) {
          setIsDisable(true);

          return needMigrate[0];
        } else {
          const exists = needMigrate.find(acc => acc.address === prevState.address);

          onChangeValue('password')('');
          setIsDisable(true);

          if (exists) {
            return prevState;
          } else {
            return needMigrate[0];
          }
        }
      });
    } else {
      setIsError(false);
      setIsDisable(true);
    }
  }, [needMigrate, deleting, step, onChangeValue]);

  useEffect(() => {
    if (step === 'Migrate') {
      if (formState.data.password && !formState.errors.password.length) {
        setIsDisable(false);
      }
    }
  }, [formState.data.password, formState.errors.password, step]);

  const onDelete = useCallback(() => {
    if (migrateAccount?.address) {
      setDeleting(true);
      setTimeout(() => {
        forgetAccount(migrateAccount.address)
          .then(() => {
            setIsError(false);
          })
          .catch((e: Error) => {
            onUpdateErrors('password')([e.message]);
          })
          .finally(() => {
            setDeleting(false);
          });
      }, 500);
    }
  }, [migrateAccount?.address, onUpdateErrors]);

  const {
    onPress: onPressDelete,
    onCancelModal: onCancelDelete,
    visible: deleteVisible,
    onCompleteModal: onCompleteDeleteModal,
    setVisible,
  } = useConfirmModal(onDelete);

  const onChangePasswordValue = (currentValue: string) => {
    if (!currentValue) {
      onUpdateErrors('password')([i18n.warningMessage.requireMessage]);
    }

    onChangeValue('password')(currentValue);
  };

  const title = useMemo((): string => {
    const _migrated = canMigrate.length - needMigrate.length;

    switch (step) {
      case 'Introduction':
        return i18n.header.applyMasterPassword;
      case 'Done':
        return i18n.header.successful;
      case 'Migrate':
        return `${String(_migrated + 1).padStart(2, '0')}/${String(canMigrate.length).padStart(2, '0')}`;
      default:
        return '';
    }
  }, [canMigrate.length, needMigrate.length, step]);

  const onComplete = useCallback(() => {
    if (selectedAction.current === 'migratePassword') {
      setStep('Migrate');
    }
  }, []);

  const onPressActionButton = useCallback(
    (action: SelectedActionType) => {
      selectedAction.current = action;
      onPress(onComplete)()?.catch(noop).finally(noop);
    },
    [onComplete, onPress],
  );

  const onPressSubmit = useCallback(() => {
    onSubmit(formState);
  }, [formState, onSubmit]);

  const renderFooterButton = useCallback(() => {
    switch (step) {
      case 'Introduction':
        return (
          <Button icon={nextIcon} onPress={() => onPressActionButton('migratePassword')}>
            {i18n.buttonTitles.applyMasterPassword}
          </Button>
        );
      case 'Done':
        return (
          <Button icon={finishIcon} onPress={goHome}>
            {i18n.buttonTitles.finish}
          </Button>
        );
      case 'Migrate':
        return (
          <Button
            loading={loading}
            disabled={isDisabled || deleting || !!formState.errors.password.length || loading}
            icon={
              <Icon
                phosphorIcon={ArrowCircleRight}
                size={'lg'}
                weight={'fill'}
                iconColor={
                  isDisabled || deleting || !!formState.errors.password.length
                    ? theme.colorTextLight5
                    : theme.colorWhite
                }
              />
            }
            onPress={onPressSubmit}>
            {i18n.buttonTitles.next}
          </Button>
        );
    }
  }, [
    step,
    goHome,
    loading,
    isDisabled,
    deleting,
    formState.errors.password.length,
    theme.colorTextLight5,
    theme.colorWhite,
    onPressSubmit,
    onPressActionButton,
  ]);

  const _onPressBack = useCallback(() => {
    if (step === 'Migrate') {
      setStep('Introduction');
    }
  }, [step]);

  return (
    <ContainerWithSubHeader
      showLeftBtn={step === 'Migrate'}
      disabled={loading}
      onPressBack={_onPressBack}
      title={title}
      showRightBtn={true}
      rightIcon={Info}>
      <View style={{ flex: 1 }}>
        {step === 'Introduction' && <Introduction />}
        {step === 'Migrate' && migrateAccount && (
          <ScrollView style={{ flex: 1, paddingHorizontal: theme.padding }}>
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 32, paddingTop: 16 }}>
              <Avatar
                size={112}
                value={migrateAccount.address}
                theme={migrateAccount.type === 'ethereum' ? 'ethereum' : 'polkadot'}
              />
            </View>

            <TextField text={migrateAccount.name || ''} label={i18n.inputLabel.accountName} />

            <AddressField address={migrateAccount.address} label={i18n.inputLabel.accountAddress} />

            <PasswordField
              ref={formState.refs.password}
              label={formState.labels.password}
              defaultValue={formState.data.password}
              onChangeText={onChangePasswordValue}
              errorMessages={formState.errors.password}
              onSubmitField={onSubmitField('password')}
            />

            {isError && (
              <Button style={{ marginTop: 4 }} size={'xs'} type={'ghost'} icon={removeIcon} onPress={onPressDelete}>
                {i18n.buttonTitles.forgetThisAccount}
              </Button>
            )}
          </ScrollView>
        )}
        {step === 'Done' && <ApplyDone accounts={canMigrate} />}

        <DeleteModal
          setVisible={setVisible}
          title={i18n.removeAccount.removeAccountTitle}
          visible={deleteVisible}
          message={i18n.removeAccount.removeAccountMessage}
          onCancelModal={onCancelDelete}
          onCompleteModal={onCompleteDeleteModal}
        />

        <View style={_style.footerAreaStyle}>{renderFooterButton()}</View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default ApplyMasterPassword;
