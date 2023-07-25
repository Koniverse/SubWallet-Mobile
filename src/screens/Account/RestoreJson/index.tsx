import AvatarGroup from 'components/common/AvatarGroup';
import useUnlockModal from 'hooks/modal/useUnlockModal';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { DotsThree, FileArrowDown, X } from 'phosphor-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ListRenderItemInfo, Platform, ScrollView, View } from 'react-native';
import { InputFile } from 'components/common/Field/InputFile';
import { KeyringPair$Json } from '@polkadot/keyring/types';
import { KeyringPairs$Json } from '@polkadot/ui-keyring/types';
import { DirectoryPickerResponse, DocumentPickerResponse } from 'react-native-document-picker';
import * as RNFS from 'react-native-fs';
import { isKeyringPairs$Json } from 'types/typeGuards';
import { batchRestoreV2, jsonGetAccountInfo, jsonRestoreV2 } from 'messaging/index';
import { ResponseJsonGetAccountInfo } from '@subwallet/extension-base/background/types';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { Warning } from 'components/Warning';
import { PasswordField } from 'components/Field/Password';
import i18n from 'utils/i18n/i18n';
import { backToHome } from 'utils/navigation';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import useGoHome from 'hooks/screen/useGoHome';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { Button, Icon, SelectItem, SwModal, Typography } from 'components/design-system-ui';
import createStyles from './styles';
import { getButtonIcon } from 'utils/button';
import { SelectAccountItem } from 'components/common/SelectAccountItem';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';

const getAccountsInfo = (jsonFile: KeyringPairs$Json) => {
  let currentAccountsInfo: ResponseJsonGetAccountInfo[] = [];
  jsonFile.accounts.forEach(account => {
    currentAccountsInfo.push({
      address: account.address,
      genesisHash: account.meta.genesisHash,
      name: account.meta.name,
    } as ResponseJsonGetAccountInfo);
  });

  return currentAccountsInfo;
};

function formatJsonFile(jsonFile: any) {
  let newJsonFile = jsonFile;
  if (isKeyringPairs$Json(jsonFile)) {
    newJsonFile.accounts.forEach((acc: { meta: { genesisHash: string } }) => (acc.meta.genesisHash = ''));

    return newJsonFile;
  } else {
    newJsonFile.meta.genesisHash = '';
    return newJsonFile;
  }
}

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

  const [isShowPasswordField, setIsShowPasswordField] = useState(false);
  const [isFileError, setFileError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [accountsInfo, setAccountsInfo] = useState<ResponseJsonGetAccountInfo[]>([]);
  const [visible, setVisible] = useState(false);
  const modalBaseV2Ref = useRef<SWModalRefProps>(null);

  const addresses = useMemo(() => accountsInfo.map(acc => acc.address), [accountsInfo]);

  useHandlerHardwareBackPress(isBusy);
  const _onRestore = (formState: FormState) => {
    const password = formState.data.password;
    const accountAddress = formState.data.accountAddress;
    let jsonFile;
    if (formState.data.file) {
      jsonFile = JSON.parse(formState.data.file) as KeyringPair$Json | KeyringPairs$Json;
    }

    if (!jsonFile) {
      return;
    }
    if (!password) {
      return;
    }

    const formattedJsonFile = formatJsonFile(jsonFile);
    const isMultiple = isKeyringPairs$Json(jsonFile);

    setIsBusy(true);
    (isMultiple
      ? batchRestoreV2(formattedJsonFile, password, getAccountsInfo(formattedJsonFile), true)
      : jsonRestoreV2({
          file: formattedJsonFile,
          password: password,
          address: accountAddress,
          isAllowed: true,
          withMasterPassword: true,
        })
    )
      .then(() => {
        setFileError(false);
        setIsBusy(false);
        onUpdateErrors('password')([]);
        setAccountsInfo(() => []);
        if (!isMultiple) {
          backToHome(goHome);
        }
      })
      .catch(e => {
        setIsBusy(false);
        console.log(e);
        onUpdateErrors('password')([i18n.warningMessage.unableDecode]);
      });
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(formConfig, {
    onSubmitForm: _onRestore,
  });

  const _onReadFile = (fileContent: KeyringPair$Json | KeyringPairs$Json) => {
    try {
      if (isKeyringPairs$Json(fileContent)) {
        fileContent.accounts.forEach(account => {
          setAccountsInfo(old => [
            ...old,
            {
              address: account.address,
              genesisHash: account.meta.genesisHash,
              name: account.meta.name,
            } as ResponseJsonGetAccountInfo,
          ]);
        });
      } else {
        jsonGetAccountInfo(fileContent)
          .then(accountInfo => {
            onChangeValue('accountAddress')(accountInfo.address);
            setAccountsInfo(old => [...old, accountInfo]);
          })
          .catch(() => {
            setFileError(true);
          });
      }
      onChangeValue('password')('');
      onUpdateErrors('password')([]);
      setIsShowPasswordField(true);
    } catch (e) {
      console.error(e);
      setFileError(true);
    }
  };

  const _onChangeFile = (fileInfo: Array<DocumentPickerResponse> | DirectoryPickerResponse | undefined | null) => {
    if (!fileInfo || !(fileInfo as Array<DocumentPickerResponse>).length) {
      return;
    }

    setFileError(false);
    onUpdateErrors('password')([]);
    setAccountsInfo(() => []);
    setIsShowPasswordField(false);

    fileInfo = fileInfo as Array<DocumentPickerResponse>;
    const fileUri = Platform.OS === 'ios' ? decodeURIComponent(fileInfo[0].uri) : fileInfo[0].uri;
    onChangeValue('fileName')(`${fileInfo[0].name}`);
    RNFS.readFile(fileUri, 'ascii')
      .then(res => {
        onChangeValue('file')(res);
        _onReadFile(JSON.parse(res) as KeyringPair$Json | KeyringPairs$Json);
      })
      .catch(() => {
        setFileError(true);
      });
  };

  const renderAccount = useCallback(
    ({ item }: ListRenderItemInfo<ResponseJsonGetAccountInfo>) => {
      return (
        <View style={{ marginLeft: -theme.margin, marginRight: -theme.margin }}>
          <SelectAccountItem isShowEditBtn={false} key={item.address} address={item.address} accountName={item.name} />
        </View>
      );
    },
    [theme.margin],
  );

  const _onPressBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const onPressSubmitButton = () => {
    _onRestore(formState);
  };

  const openModal = useCallback(() => {
    setVisible(true);
  }, []);

  const hideModal = useCallback(() => {
    setVisible(false);
  }, []);

  const { onPress: onPressSubmit } = useUnlockModal(navigation);

  useEffect(() => {
    let amount = true;
    if (isShowPasswordField) {
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

  const isDisabled = useMemo(
    () => !formState.data.file || isFileError || !formState.isValidated.password || !formState.data.password || isBusy,
    [formState.data.file, formState.data.password, formState.isValidated.password, isBusy, isFileError],
  );

  return (
    <ContainerWithSubHeader
      title={i18n.header.importFromJson}
      onPressBack={_onPressBack}
      disabled={isBusy}
      rightIcon={X}
      onPressRightIcon={goHome}
      disableRightButton={isBusy}>
      <View style={styles.wrapper}>
        <ScrollView style={styles.container}>
          <Typography.Text style={styles.title}>{i18n.importAccount.importJsonSubtitle}</Typography.Text>
          <InputFile disabled={isBusy} onChangeResult={_onChangeFile} fileName={formState.data.fileName} />
          {isFileError && (
            <Warning
              style={styles.error}
              title={i18n.warningTitle.error}
              message={i18n.warningMessage.invalidJsonFile}
              isDanger
            />
          )}
          {!!accountsInfo.length && (
            <View style={styles.accountPreview}>
              {accountsInfo.length > 1 ? (
                <SelectItem
                  leftItemIcon={<AvatarGroup addresses={addresses} />}
                  label={i18n.importAccount.importAccounts(String(accountsInfo.length).padStart(2, '0'))}
                  onPress={openModal}
                  rightIcon={<Icon phosphorIcon={DotsThree} size="sm" />}
                />
              ) : (
                <SelectItem leftItemIcon={<AvatarGroup addresses={addresses} />} label={accountsInfo[0].name} />
              )}
            </View>
          )}
          {isShowPasswordField && (
            <>
              <Typography.Text style={styles.description}>{i18n.importAccount.importJsonMessage}</Typography.Text>
              <View style={styles.passwordContainer}>
                <PasswordField
                  ref={formState.refs.password}
                  defaultValue={formState.data.password}
                  onChangeText={onChangeValue('password')}
                  errorMessages={formState.errors.password}
                  onSubmitField={onSubmitField('password')}
                  showEyeButton={false}
                  outerStyle={styles.passwordField}
                  placeholder={i18n.placeholder.password}
                  isBusy={isBusy}
                />
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            loading={isBusy}
            icon={getButtonIcon(FileArrowDown)}
            onPress={onPressSubmit(onPressSubmitButton)}
            disabled={isDisabled}>
            {i18n.buttonTitles.importByJsonFile}
          </Button>
        </View>
      </View>
      <SwModal
        isUseModalV2
        modalBaseV2Ref={modalBaseV2Ref}
        setVisible={setVisible}
        modalVisible={visible}
        modalTitle={i18n.header.accounts}
        onBackButtonPress={hideModal}>
        <FlatList data={accountsInfo} renderItem={renderAccount} style={styles.accountList} />
      </SwModal>
    </ContainerWithSubHeader>
  );
};
