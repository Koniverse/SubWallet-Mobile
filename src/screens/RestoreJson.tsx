import React, { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleProp, View } from 'react-native';
import { InputFile } from 'components/InputFile';
import { KeyringPair$Json } from '@polkadot/keyring/types';
import { KeyringPairs$Json } from '@polkadot/ui-keyring/types';
import { DirectoryPickerResponse, DocumentPickerResponse } from 'react-native-document-picker';
import * as RNFS from 'react-native-fs';
import { SubmitButton } from 'components/SubmitButton';
import { isKeyringPairs$Json } from 'types/typeGuards';
import { batchRestoreV2, jsonGetAccountInfo, jsonRestoreV2 } from '../messaging';
import { ResponseJsonGetAccountInfo } from '@subwallet/extension-base/background/types';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { RootNavigationProps } from 'types/routes';
import { Warning } from 'components/Warning';
import { PasswordField } from 'components/Field/Password';
import { Account } from 'components/Account';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { backToHome } from 'utils/navigation';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginHorizontal: 16,
  ...MarginBottomForSubmitButton,
};

const formConfig = {
  file: {
    name: '',
    value: '',
  },
  password: {
    require: true,
    name: i18n.common.walletPassword,
    value: '',
    validateFunc: validatePassword,
  },
};

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

export const RestoreJson = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [file, setFile] = useState<KeyringPair$Json | KeyringPairs$Json | undefined>(undefined);
  const [isFileError, setFileError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [accountsInfo, setAccountsInfo] = useState<ResponseJsonGetAccountInfo[]>([]);
  const _onRestore = (formState: FormState) => {
    const password = formState.data.password;
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

    setIsBusy(true);
    (isKeyringPairs$Json(jsonFile)
      ? batchRestoreV2(jsonFile, password, getAccountsInfo(jsonFile), true)
      : jsonRestoreV2(jsonFile, password, jsonFile.address, true)
    )
      .then(() => {
        setFileError(false);
        setIsBusy(false);
        onUpdateErrors('password')([]);
        setAccountsInfo(() => []);
        backToHome(navigation, true);
      })
      .catch(() => {
        setIsBusy(false);
        onUpdateErrors('password')([i18n.warningMessage.unableDecode]);
      });
  };
  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: _onRestore,
  });
  const _onReadFile = (fileContent: KeyringPair$Json | KeyringPairs$Json) => {
    setFile(fileContent);

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
            setAccountsInfo(old => [...old, accountInfo]);
          })
          .catch(() => {
            setFileError(true);
          });
      }
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

    fileInfo = fileInfo as Array<DocumentPickerResponse>;
    const fileUri = Platform.OS === 'ios' ? decodeURIComponent(fileInfo[0].uri) : fileInfo[0].uri;

    RNFS.readFile(fileUri, 'ascii')
      .then(res => {
        onChangeValue('file')(res);
        _onReadFile(JSON.parse(res) as KeyringPair$Json | KeyringPairs$Json);
      })
      .catch(() => {
        setFileError(true);
      });
  };

  const renderAccount = useCallback(() => {
    return (
      <>
        {accountsInfo.map(account => (
          <View
            key={account.address}
            style={{ backgroundColor: ColorMap.dark2, marginBottom: 8, borderRadius: 5, paddingHorizontal: 16 }}>
            <Account
              address={account.address}
              name={account.name}
              showCopyBtn={false}
              showSelectedIcon={false}
              isDisabled
            />
          </View>
        ))}
      </>
    );
  }, [accountsInfo]);

  return (
    <SubScreenContainer title={i18n.title.importFromJson} navigation={navigation}>
      <View style={{ flex: 1 }}>
        <ScrollView style={{ ...sharedStyles.layoutContainer }}>
          <InputFile onChangeResult={_onChangeFile} />
          {renderAccount()}
          <PasswordField
            label={formState.labels.password}
            onChangeText={onChangeValue('password')}
            errorMessages={formState.errors.password}
            onSubmitField={onSubmitField('password')}
          />
          {isFileError && (
            <Warning title={i18n.warningTitle.error} message={i18n.warningMessage.invalidJsonFile} isDanger />
          )}
        </ScrollView>

        <View style={footerAreaStyle}>
          <SubmitButton
            isBusy={isBusy}
            title={i18n.common.importAccount}
            onPress={() => _onRestore(formState)}
            disabled={isFileError || !formState.isValidated.password || !formState.data.password || !file}
          />
        </View>
      </View>
    </SubScreenContainer>
  );
};
