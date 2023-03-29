import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { ScrollView, Text, View } from 'react-native';
import { Avatar, Button, Icon, Modal, PageIcon } from 'components/design-system-ui';
import { ArrowCircleRight, CheckCircle, Info, ShieldStar, Trash } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ApplyMasterPasswordStyle from './style';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-base/constants';
import { AddressField } from 'components/Field/Address';
import { TextField } from 'components/Field/Text';
import useFormControl, { FormControlConfig } from 'hooks/screen/useFormControl';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { PasswordField } from 'components/Field/Password';
import { forgetAccount } from '../../../messaging';

type PageStep = 'Introduction' | 'Migrate' | 'Done';

const nextIcon = <Icon phosphorIcon={ArrowCircleRight} size={'lg'} weight={'fill'} />;

const finishIcon = <Icon phosphorIcon={CheckCircle} size={'lg'} weight="fill" />;

const removeIcon = <Icon phosphorIcon={Trash} size={'lg'} iconColor={'#737373'} />;

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
  const _style = ApplyMasterPasswordStyle(theme);
  const { accounts } = useSelector((state: RootState) => state.accountState);
  const [step, setStep] = useState<PageStep>('Introduction');
  const [migrateAccount, setMigrateAccount] = useState<AccountJson | undefined>(undefined);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isDisabled, setIsDisable] = useState(true);
  const [isError, setIsError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const canMigrate = useMemo(
    () => accounts.filter(acc => acc.address !== ALL_ACCOUNT_KEY && !acc.isExternal),
    [accounts],
  );

  const needMigrate = useMemo(() => canMigrate.filter(acc => !acc.isMasterPassword), [canMigrate]);

  useEffect(() => {
    setStep(prevState => {
      if (prevState !== 'Introduction') {
        return needMigrate.length ? 'Migrate' : 'Done';
      } else {
        return 'Introduction';
      }
    });
  }, [needMigrate.length, deleting]);

  useEffect(() => {
    if (step === 'Migrate') {
      setMigrateAccount(prevState => {
        if (deleting) {
          return prevState;
        }

        if (!prevState) {
          // form.resetFields();
          setIsDisable(true);

          return needMigrate[0];
        } else {
          const exists = needMigrate.find(acc => acc.address === prevState.address);

          // form.resetFields();
          setIsDisable(true);

          if (exists) {
            return prevState;
          } else {
            return needMigrate[0];
          }
        }
      });

      // focusPassword();
    } else {
      setIsError(false);
      // form.resetFields();
      setIsDisable(true);
    }
  }, [needMigrate, deleting, step]);

  const onSubmit = () => {};

  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

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
    const migrated = 1;

    switch (step) {
      case 'Introduction':
        return 'Apply master password';
      case 'Done':
        return 'Successful';
      case 'Migrate':
        return `${String(migrated + 1).padStart(2, '0')}/${String(accounts.length).padStart(2, '0')}`;
      default:
        return '';
    }
  }, [accounts.length, step]);

  const renderFooterButton = useCallback(() => {
    switch (step) {
      case 'Introduction':
        return (
          <Button
            icon={nextIcon}
            onPress={() => {
              setStep(accounts.length ? 'Migrate' : 'Done');
            }}>
            {'Apply master password now'}
          </Button>
        );
      case 'Done':
        return (
          <Button icon={finishIcon} onPress={onPressButton}>
            {'Finish'}
          </Button>
        );
      case 'Migrate':
        return (
          <Button disabled={isDisabled || deleting} icon={nextIcon} onPress={onPressButton}>
            {'Next'}
          </Button>
        );
    }
  }, [accounts.length, deleting, isDisabled, step]);

  const onPressButton = () => {};

  return (
    <ContainerWithSubHeader
      showLeftBtn={true}
      onPressBack={() => {}}
      title={title}
      showRightBtn={true}
      rightIcon={Info}>
      <View style={{ flex: 1 }}>
        {step === 'Introduction' && (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', paddingTop: 48 }}>
              <PageIcon icon={ShieldStar} color={theme.colorSuccess} />
              <Text style={_style.titleStyle}>{'Apply master password'}</Text>
              <Text style={_style.messageStyle}>
                {'Master password created successfully. Please apply the master password to your existing accounts'}
              </Text>
            </View>
          </View>
        )}
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
            {/*<AccountInfoField name={migrateAccount.name || ''} address={migrateAccount.address} />*/}

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
        {step === 'Done' && (
          <View style={{ flex: 1 }}>
            <Text>123</Text>
          </View>
        )}

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
