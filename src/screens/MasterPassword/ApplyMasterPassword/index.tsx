import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { DeviceEventEmitter, ScrollView, View } from 'react-native';
import { Avatar, Button, Icon, Modal } from 'components/design-system-ui';
import { ArrowCircleRight, CheckCircle, Info, Trash } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ApplyMasterPasswordStyle from './style';
import { RootState } from 'stores/index';
import { useDispatch, useSelector } from 'react-redux';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { AddressField } from 'components/Field/Address';
import { TextField } from 'components/Field/Text';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { PasswordField } from 'components/Field/Password';
import { forgetAccount, keyringMigrateMasterPassword } from '../../../messaging';
import { Introduction } from 'screens/MasterPassword/ApplyMasterPassword/Introduction';
import { ApplyDone } from 'screens/MasterPassword/ApplyMasterPassword/ApplyDone';
import useGoHome from 'hooks/screen/useGoHome';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { updatePasswordModalState, updateSelectedAction } from 'stores/PasswordModalState';

type PageStep = 'Introduction' | 'Migrate' | 'Done';

const finishIcon = <Icon phosphorIcon={CheckCircle} size={'lg'} weight="fill" />;

const removeIcon = <Icon phosphorIcon={Trash} size={'lg'} iconColor={'#737373'} />;

const nextIcon = <Icon phosphorIcon={ArrowCircleRight} size={'lg'} weight={'fill'} />;

const formConfig: FormControlConfig = {
  password: {
    name: 'Current password',
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
};

const ApplyMasterPassword = () => {
  const theme = useSubWalletTheme().swThemes;
  const goHome = useGoHome();
  const navigation = useNavigation<RootNavigationProps>();
  const _style = ApplyMasterPasswordStyle(theme);
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const [step, setStep] = useState<PageStep>('Introduction');
  const [migrateAccount, setMigrateAccount] = useState<AccountJson | undefined>(undefined);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isDisabled, setIsDisable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();

  const canMigrate = useMemo(
    () => accounts.filter(acc => acc.address !== ALL_ACCOUNT_KEY && !acc.isExternal),
    [accounts],
  );

  const needMigrate = useMemo(() => {
    return canMigrate.filter(acc => !acc.isMasterPassword);
  }, [canMigrate]);

  const onSubmit = useCallback(() => {
    const password = formState.data.password;
    if (migrateAccount?.address && password) {
      setLoading(true);
      setTimeout(() => {
        keyringMigrateMasterPassword({
          address: migrateAccount.address,
          password: password,
        })
          .then(res => {
            if (!res.status) {
              onUpdateErrors('password')([res.errors[0]]);
              setIsError(true);
            } else {
              setIsError(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [migrateAccount?.address]);

  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  useEffect(() => {
    const event = DeviceEventEmitter.addListener('migratePassword', () => {
      setStep('Migrate');
    });

    return () => {
      event.remove();
    };
  }, []);

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

  const onChangePasswordValue = (currentValue: string) => {
    onChangeValue('password')(currentValue);
  };

  const title = useMemo((): string => {
    const migrated = canMigrate.length - needMigrate.length;

    switch (step) {
      case 'Introduction':
        return 'Apply master password';
      case 'Done':
        return 'Successful';
      case 'Migrate':
        return `${String(migrated + 1).padStart(2, '0')}/${String(canMigrate.length).padStart(2, '0')}`;
      default:
        return '';
    }
  }, [canMigrate.length, needMigrate.length, step]);

  const renderFooterButton = useCallback(() => {
    switch (step) {
      case 'Introduction':
        return (
          <Button
            icon={nextIcon}
            onPress={() => {
              dispatch(updatePasswordModalState(true));
              dispatch(updateSelectedAction('migratePassword'));
            }}>
            {'Apply master password now'}
          </Button>
        );
      case 'Done':
        return (
          <Button icon={finishIcon} onPress={goHome}>
            {'Finish'}
          </Button>
        );
      case 'Migrate':
        return (
          <Button loading={loading} disabled={isDisabled || deleting} icon={nextIcon} onPress={onSubmit}>
            {'Next'}
          </Button>
        );
    }
  }, [step, goHome, loading, isDisabled, deleting, onSubmit, dispatch]);

  return (
    <ContainerWithSubHeader
      showLeftBtn={false}
      disabled={loading}
      onPressBack={() => navigation.canGoBack() && navigation.goBack()}
      title={title}
      showRightBtn={true}
      rightIcon={Info}>
      <View style={{ flex: 1 }}>
        {step === 'Introduction' && <Introduction />}
        {step === 'Migrate' && migrateAccount && (
          <ScrollView style={{ flex: 1, paddingHorizontal: theme.padding }}>
            <View style={{ alignItems: 'center', paddingBottom: 32, paddingTop: 16 }}>
              <Avatar
                size={112}
                value={migrateAccount.address}
                theme={migrateAccount.type === 'ethereum' ? 'ethereum' : 'polkadot'}
              />
            </View>

            <TextField text={migrateAccount.name || ''} label={'Account name'} />

            <AddressField address={migrateAccount.address} label={'Account address'} />

            <PasswordField
              ref={formState.refs.password}
              label={formState.labels.password}
              defaultValue={formState.data.password}
              onChangeText={onChangePasswordValue}
              errorMessages={formState.errors.password}
              onSubmitField={onSubmitField('password')}
            />

            {isError && (
              <Button
                style={{ marginTop: 4 }}
                size={'xs'}
                type={'ghost'}
                icon={removeIcon}
                onPress={() => setModalVisible(true)}>
                {'Forget this account'}
              </Button>
            )}
          </ScrollView>
        )}
        {step === 'Done' && <ApplyDone accounts={canMigrate} />}

        <Modal.DeleteModal
          title={'Detele this account?'}
          visible={modalVisible}
          message={
            'If you ever want to use this account again, you would need to import it again with seedphrase, private key, or JSON file'
          }
          onDelete={onDelete}
        />

        <View style={_style.footerAreaStyle}>{renderFooterButton()}</View>
      </View>
    </ContainerWithSubHeader>
  );
};

export default ApplyMasterPassword;
