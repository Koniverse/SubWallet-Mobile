import useUnlockModal from 'hooks/modal/useUnlockModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { FileArrowDown, Warning, X } from 'phosphor-react-native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { InputFile } from 'components/common/Field/InputFile';
import type { KeyringPair$Json } from '@subwallet/keyring/types';
import type { KeyringPairs$Json } from '@subwallet/ui-keyring/types';
import { DirectoryPickerResponse, DocumentPickerResponse } from 'react-native-document-picker';
import * as RNFS from 'react-native-fs';
import { isKeyringPairs$Json } from 'types/typeGuards';
import { batchRestoreV2, jsonRestoreV2, parseBatchSingleJson, parseInfoSingleJson } from 'messaging/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Warning as WarningComponent } from 'components/Warning';
import { PasswordField } from 'components/Field/Password';
import i18n from 'utils/i18n/i18n';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { Button, PageIcon, SwModal, Typography } from 'components/design-system-ui';
import createStyles from './styles';
import { getButtonIcon } from 'utils/button';
import { FontMedium } from 'styles/sharedStyles';
import { useToast } from 'react-native-toast-notifications';
import { ValidateStatus } from '@subwallet/react-ui/es/form/FormItem';
import { AccountProxyExtra } from '@subwallet/extension-base/types';
import { isValidJsonFile } from 'utils/account/typeGuards';
import { AppModalContext } from 'providers/AppModalContext';
import { ImportJsonAccountSelector } from 'screens/Account/RestoreJson/ImportJsonAccountSelector';
import AlertBox from 'components/design-system-ui/alert-box/simple';

const enum StepState {
  UPLOAD_JSON_FILE = 'upload_json_file',
  SELECT_ACCOUNT_IMPORT = 'select_account_import',
}

export interface ValidateState {
  status?: ValidateStatus;
  message?: string;
  tooltip?: string;
}

export interface AccountProxyExtra_ extends AccountProxyExtra {
  isNameDuplicated?: boolean;
  group?: string;
}

const RestoreAccGroupLabel: Record<string, string> = {
  existed_accounts: 'Existed account',
  valid_accounts: '',
};

const getDuplicateAccountNames = (accounts: AccountProxyExtra_[], accountsSelected?: string[]): string[] => {
  const accountNameMap = new Map<string, number>();
  const duplicates: string[] = [];

  accounts.forEach(account => {
    if (!accountsSelected || accountsSelected.includes(account.id)) {
      const count = accountNameMap.get(account.name) || 0;

      if (!account.isExistAccount) {
        accountNameMap.set(account.name, count + 1);
      }
    }
  });

  accountNameMap.forEach((count, accountName) => {
    if (count > 1) {
      duplicates.push(accountName);
    }
  });

  return duplicates;
};

export const RestoreJson = () => {
  const formConfig: FormControlConfig = {
    file: {
      name: 'file',
      value: '',
    },
    fileName: {
      name: 'fileName',
      value: '',
    },
    accountAddress: {
      name: '',
      value: '',
    },
    password: {
      require: true,
      name: i18n.common.currentPassword,
      value: '',
      validateFunc: validatePassword,
    },
  };
  const navigation = useNavigation<RootNavigationProps>();
  const goHome = useGoHome();
  const theme = useSubWalletTheme().swThemes;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { confirmModal } = useContext(AppModalContext);

  const [isShowPasswordField, setIsShowPasswordField] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [stepState, setStepState] = useState<StepState>(StepState.UPLOAD_JSON_FILE);
  const [showNoValidAccountAlert, setShowNoValidAccountAlert] = useState(false);
  const [accountProxies, setAccountProxies] = useState<AccountProxyExtra_[]>([]);
  const [accountProxiesSelected, setAccountProxiesSelected] = useState<string[]>([]);
  const [fileValidateState, setFileValidateState] = useState<ValidateState>({});
  const [passwordValidateState, setPasswordValidateState] = useState<ValidateState>({});
  const [fileValidating, setFileValidating] = useState(false);
  const [passwordValidating, setPasswordValidating] = useState(false);
  const { show, hideAll } = useToast();

  useHandlerHardwareBackPress(submitting);

  const listItem = useMemo<AccountProxyExtra_[]>(() => {
    const result: AccountProxyExtra_[] = [];
    const exitedAccount: AccountProxyExtra_[] = [];
    const listAccountNameDuplicate = getDuplicateAccountNames(accountProxies);

    accountProxies.forEach(ap => {
      if (ap.isExistAccount) {
        exitedAccount.push({ ...ap, group: 'existed_accounts' });
      } else {
        if (listAccountNameDuplicate.includes(ap.name)) {
          ap.isNameDuplicated = true;
        }

        result.push({ ...ap, group: 'valid_accounts' });
      }
    });
    if (accountProxies.length > 0) {
      setShowNoValidAccountAlert(exitedAccount.length === accountProxies.length);
    }
    if (result.length === 1) {
      setAccountProxiesSelected([result[0].id]);
    }

    if (exitedAccount.length) {
      result.push(...exitedAccount);
    }
    return result;
  }, [accountProxies]);

  const groupBy = useCallback((item: AccountProxyExtra_) => {
    return item.group ? `${RestoreAccGroupLabel[item.group]}` : '';
  }, []);

  const renderSectionHeader: (item: string, itemLength?: number) => React.ReactElement | null = useCallback(
    (item: string) => {
      return (
        <View key={item} style={styles.sectionHeaderContainer}>
          <Typography.Text size={'sm'} style={styles.sectionHeaderTitle}>
            {`${item.split('|')[0]} `}
          </Typography.Text>
        </View>
      );
    },
    [styles.sectionHeaderContainer, styles.sectionHeaderTitle],
  );

  const grouping = useMemo(() => {
    return { groupBy, sortSection: undefined, renderSectionHeader };
  }, [groupBy, renderSectionHeader]);

  const onValidatePassword = useCallback(
    (jsonFile: KeyringPair$Json | KeyringPairs$Json, password: string) => {
      if (!jsonFile || passwordValidating) {
        return;
      }
      setPasswordValidating(true);

      const onFail = (e: Error) => {
        setPasswordValidateState({
          status: 'error',
          message: e.message,
        });
        focus('password')();
      };

      if (isKeyringPairs$Json(jsonFile)) {
        parseBatchSingleJson({
          json: jsonFile,
          password,
        })
          .then(({ accountProxies: _accountProxies }) => {
            setAccountProxies(_accountProxies);
            setPasswordValidateState({ status: 'success' });
          })
          .catch(onFail)
          .finally(() => {
            setPasswordValidating(false);
          });
      } else {
        parseInfoSingleJson({
          json: jsonFile,
          password,
        })
          .then(({ accountProxy }) => {
            setAccountProxies([accountProxy]);
            setPasswordValidateState({ status: 'success' });
          })
          .catch(onFail)
          .finally(() => {
            setPasswordValidating(false);
          });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [passwordValidating],
  );

  const onImportFinal = useCallback(
    (jsonFile: KeyringPair$Json | KeyringPairs$Json, password: string) => {
      if (!jsonFile) {
        return;
      }

      if (!password) {
        return;
      }

      setSubmitting(true);

      const isMultiple = isKeyringPairs$Json(jsonFile);

      (isMultiple
        ? batchRestoreV2({
            file: jsonFile as KeyringPairs$Json,
            password,
            isAllowed: true,
            proxyIds: accountProxiesSelected,
          })
        : jsonRestoreV2({
            file: jsonFile as KeyringPair$Json,
            password: password,
            address: accountProxiesSelected[0],
            isAllowed: true,
            withMasterPassword: true,
          })
      )
        .then(addressList => {
          if (addressList.length === 1) {
            hideAll();
            show('1 account imported', { type: 'success' });
          } else if (addressList.length > 1) {
            hideAll();
            show(`${addressList.length} accounts imported`, { type: 'success' });
          }
          setSubmitting(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        })
        .catch(e => {
          setSubmitting(false);
          setPasswordValidateState({
            message: e.message,
            status: 'error',
          });
          focus('password')();
        });
    },
    // eslint-disable-next-line
    [accountProxiesSelected, hideAll, navigation, show],
  );

  const openExitedAccountNameWarningModal = useCallback(
    (jsonFile: KeyringPair$Json | KeyringPairs$Json, password: string) => {
      confirmModal.setConfirmModal({
        visible: true,
        title: 'Duplicate account name',
        message:
          'You have accounts with the same name. We have added numbers to these account names to differentiate them. You can change account names later using |hyperlink this guide|',
        onCompleteModal: () => {
          confirmModal.hideConfirmModal();
          onImportFinal(jsonFile, password);
        },
      });
    },
    [confirmModal, onImportFinal],
  );

  const onImport = useCallback(
    (jsonFile: KeyringPair$Json | KeyringPairs$Json, password: string) => {
      if (!jsonFile || accountProxiesSelected.length === 0) {
        return;
      }

      const accountSelectedDuplicatedNames = getDuplicateAccountNames(accountProxies, accountProxiesSelected);

      const isHasAccountInvalidName = accountProxiesSelected.some(ap => {
        const accountProxy = accountProxies.find(a => a.id === ap);

        return accountProxy?.isExistName || accountSelectedDuplicatedNames.includes(accountProxy?.name || '');
      });

      if (isHasAccountInvalidName) {
        openExitedAccountNameWarningModal(jsonFile, password);
      } else {
        onImportFinal(jsonFile, password);
      }
    },
    [accountProxies, accountProxiesSelected, onImportFinal, openExitedAccountNameWarningModal],
  );

  const isRequirePassword = useCallback(
    (jsonFile: string) =>
      !fileValidating && !!jsonFile && !fileValidateState?.status && passwordValidateState?.status !== 'success',
    [fileValidating, fileValidateState?.status, passwordValidateState?.status],
  );

  const onSubmit = useCallback(
    (formState: FormState) => {
      const password = formState.data.password;
      let jsonFile;
      if (formState.data.file) {
        jsonFile = JSON.parse(formState.data.file) as KeyringPair$Json | KeyringPairs$Json;
      }

      if (!jsonFile) {
        return;
      }

      if (!isRequirePassword(formState.data.file)) {
        onImport(jsonFile, password);
      } else {
        onValidatePassword(jsonFile, password);
      }
    },
    [isRequirePassword, onImport, onValidatePassword],
  );

  const { formState, onChangeValue, onSubmitField, focus, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const _onChangeFile = (fileInfo: Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null) => {
    if (fileValidating) {
      return;
    }

    setFileValidating(true);
    setFileValidateState({});

    if (!fileInfo || !(fileInfo as Array<DocumentPickerResponse>).length) {
      return;
    }

    setIsShowPasswordField(false);

    fileInfo = fileInfo as Array<DocumentPickerResponse>;
    const fileUri = Platform.OS === 'ios' ? decodeURIComponent(fileInfo[0].uri) : fileInfo[0].uri;
    onChangeValue('fileName')(`${fileInfo[0].name}`);
    RNFS.readFile(fileUri, 'ascii')
      .then(res => {
        const file = JSON.parse(res) as KeyringPair$Json | KeyringPairs$Json;
        if (!isValidJsonFile(file)) {
          throw new Error('Invalid JSON file');
        }
        setAccountProxies([]);
        onChangeValue('file')(res);
        setPasswordValidateState({});
      })
      .catch((e: Error) => {
        setFileValidateState({
          status: 'error',
          message: e.message,
        });
      })
      .finally(() => {
        setTimeout(() => focus('password')(), 300);
        setFileValidating(false);
      });
  };

  const _onPressBack = useCallback(() => {
    if (stepState === StepState.SELECT_ACCOUNT_IMPORT) {
      onChangeValue('file')('');
      onChangeValue('fileName')('');
      onChangeValue('password')('');
      setAccountProxies([]);
      setAccountProxiesSelected([]);
      setStepState(StepState.UPLOAD_JSON_FILE);
      onUpdateErrors('password')([]);
    } else {
      navigation.goBack();
    }
  }, [navigation, onChangeValue, onUpdateErrors, stepState]);

  const onPressSubmitButton = () => {
    onSubmit(formState);
  };

  const onSelect = useCallback((account: AccountProxyExtra_) => {
    return () => {
      setAccountProxiesSelected(prev => {
        if (prev.includes(account.id)) {
          return prev.filter(id => id !== account.id);
        }

        return [...prev, account.id];
      });
    };
  }, []);

  const onChangePassword = useCallback(
    (value: string) => {
      setPasswordValidateState({});
      onChangeValue('password')(value);
    },
    [onChangeValue],
  );

  const { onPress: onPressSubmit } = useUnlockModal(navigation);

  useEffect(() => {
    let amount = true;
    if (isShowPasswordField && !warningModalVisible) {
      setTimeout(() => {
        if (amount) {
          focus('password')();
        }
      }, 300);
    }

    return () => {
      amount = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShowPasswordField]);

  useEffect(() => {
    if (accountProxies.length > 0) {
      setStepState(StepState.SELECT_ACCOUNT_IMPORT);
    } else {
      setStepState(StepState.UPLOAD_JSON_FILE);
    }
  }, [accountProxies.length]);

  const disableSubmit = useMemo<boolean>(() => {
    if (stepState === StepState.SELECT_ACCOUNT_IMPORT && accountProxiesSelected.length === 0) {
      return true;
    }

    return (
      !!fileValidateState.status ||
      (!isRequirePassword(formState.data.file) && passwordValidateState.status !== 'success') ||
      !formState.data.password
    );
  }, [
    stepState,
    accountProxiesSelected.length,
    fileValidateState.status,
    isRequirePassword,
    formState.data.file,
    formState.data.password,
    passwordValidateState.status,
  ]);

  const passwordErrors = useMemo(() => {
    const result = formState.errors.password;

    if (passwordValidateState && passwordValidateState.message) {
      result.push(passwordValidateState.message);
    }

    return result;
  }, [formState.errors.password, passwordValidateState]);

  return (
    <ContainerWithSubHeader
      title={i18n.header.importFromJson}
      onPressBack={_onPressBack}
      disabled={submitting}
      rightIcon={X}
      onPressRightIcon={goHome}
      disableRightButton={submitting}>
      <View style={styles.wrapper}>
        <ScrollView style={styles.container}>
          <Typography.Text style={styles.title}>
            {stepState === StepState.SELECT_ACCOUNT_IMPORT && passwordValidateState.status === 'success'
              ? "Select the account(s) you'd like to import"
              : i18n.importAccount.importJsonSubtitle}
          </Typography.Text>
          {stepState === StepState.SELECT_ACCOUNT_IMPORT && showNoValidAccountAlert && (
            <AlertBox
              description={'All accounts found in this file already exist in SubWallet'}
              title={'Unable to import'}
              type="warning"
            />
          )}

          {stepState === StepState.UPLOAD_JSON_FILE && (
            <>
              <InputFile disabled={submitting} onChangeResult={_onChangeFile} fileName={formState.data.fileName} />

              {fileValidateState && fileValidateState.message && fileValidateState.status === 'error' && (
                <WarningComponent
                  style={styles.error}
                  title={i18n.warningTitle.error}
                  message={fileValidateState.message}
                  isDanger
                />
              )}
            </>
          )}

          {stepState === StepState.UPLOAD_JSON_FILE && isRequirePassword(formState.data.file) && (
            <>
              <Typography.Text style={styles.description}>{i18n.importAccount.importJsonMessage}</Typography.Text>
              <View style={styles.passwordContainer}>
                <PasswordField
                  ref={formState.refs.password}
                  defaultValue={formState.data.password}
                  onChangeText={onChangePassword}
                  errorMessages={passwordErrors}
                  onSubmitField={onSubmitField('password')}
                  showEyeButton={false}
                  outerStyle={styles.passwordField}
                  placeholder={i18n.placeholder.password}
                  isBusy={submitting}
                />
              </View>
            </>
          )}

          {stepState === StepState.SELECT_ACCOUNT_IMPORT && passwordValidateState.status === 'success' && (
            <ImportJsonAccountSelector
              items={listItem}
              accountProxiesSelected={accountProxiesSelected}
              onSelect={onSelect}
              grouping={grouping}
              onClose={() => {
                setStepState(StepState.UPLOAD_JSON_FILE);
              }}
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            loading={fileValidating || passwordValidating || submitting}
            icon={getButtonIcon(FileArrowDown)}
            onPress={onPressSubmit(onPressSubmitButton)}
            disabled={disableSubmit || submitting}>
            {i18n.buttonTitles.importByJsonFile}
          </Button>
        </View>
      </View>

      <SwModal
        isUseModalV2
        setVisible={setWarningModalVisible}
        modalVisible={warningModalVisible}
        isAllowSwipeDown={false}
        disabledOnPressBackDrop={true}
        footer={
          <Button
            onPress={() => {
              setTimeout(() => {
                focus('password')();
              }, 300);
              setWarningModalVisible(false);
            }}>
            I understand
          </Button>
        }
        modalTitle={'Pay attention'}
        titleTextAlign={'center'}>
        <View style={{ paddingVertical: theme.padding, alignItems: 'center', gap: theme.padding }}>
          <PageIcon icon={Warning} color={theme.colorWarning} />

          <Typography.Text
            style={{
              color: theme.colorTextTertiary,
              ...FontMedium,
              textAlign: 'center',
            }}>
            {
              'Your imported Ledger account(s) will show up as watch-only account(s) because Ledger is not yet supported on SubWallet mobile app'
            }
          </Typography.Text>
        </View>
      </SwModal>
    </ContainerWithSubHeader>
  );
};
