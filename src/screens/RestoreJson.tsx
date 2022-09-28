import React, { useState } from 'react';
import { FlatList, ListRenderItemInfo, Platform, StyleProp, Text, View } from 'react-native';
import { InputFile } from 'components/InputFile';
import { KeyringPair$Json } from '@polkadot/keyring/types';
import { KeyringPairs$Json } from '@polkadot/ui-keyring/types';
import { DirectoryPickerResponse, DocumentPickerResponse } from 'react-native-document-picker';
import * as RNFS from 'react-native-fs';
import { SubmitButton } from 'components/SubmitButton';
import { isKeyringPairs$Json } from 'types/typeGuards';
import { batchRestoreV2, jsonGetAccountInfo, jsonRestoreV2 } from '../messaging';
import { ResponseJsonGetAccountInfo } from '@subwallet/extension-base/background/types';
import { useNavigation } from '@react-navigation/native';
import { ContainerHorizontalPadding, FontMedium, MarginBottomForSubmitButton, sharedStyles } from 'styles/sharedStyles';
import { RootNavigationProps } from 'routes/index';
import { Warning } from 'components/Warning';
import { PasswordField } from 'components/Field/Password';
import { Account } from 'components/Account';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { backToHome } from 'utils/navigation';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import { toShort } from 'utils/index';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginHorizontal: 16,
  ...MarginBottomForSubmitButton,
};

const itemWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  borderRadius: 5,
  paddingHorizontal: 16,
};

const formConfig = {
  file: {
    name: '',
    value: '',
  },
  fileConfig: {
    name: '',
    value: '',
  },
  accountAddress: {
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

const ViewStep = {
  PASTE_JSON: 1,
  ENTER_PW: 2,
};

export const RestoreJson = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [isFileError, setFileError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [accountsInfo, setAccountsInfo] = useState<ResponseJsonGetAccountInfo[]>([]);
  const [currentViewStep, setCurrentViewStep] = useState<number>(1);
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

    setIsBusy(true);
    (isKeyringPairs$Json(formattedJsonFile)
      ? batchRestoreV2(formattedJsonFile, password, getAccountsInfo(formattedJsonFile), true)
      : jsonRestoreV2(formattedJsonFile, password, accountAddress, true)
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
    onChangeValue('fileConfig')(`${fileInfo[0].name} (${fileInfo[0].size} bytes)`);
    RNFS.readFile(fileUri, 'ascii')
      .then(res => {
        onChangeValue('file')(res);
        _onReadFile(JSON.parse(res) as KeyringPair$Json | KeyringPairs$Json);
      })
      .catch(() => {
        setFileError(true);
      });
  };

  const renderAccount = ({ item }: ListRenderItemInfo<ResponseJsonGetAccountInfo>) => {
    return (
      <View key={item.address} style={[itemWrapperStyle, { marginTop: 8 }]}>
        <Account address={item.address} name={item.name} showCopyBtn={false} showSelectedIcon={false} isDisabled />
      </View>
    );
  };

  const _onPressBack = () => {
    if (currentViewStep === ViewStep.PASTE_JSON) {
      navigation.goBack();
    } else {
      setCurrentViewStep(ViewStep.PASTE_JSON);
    }
  };

  const onPressSubmitButton = () => {
    if (currentViewStep === ViewStep.PASTE_JSON) {
      setCurrentViewStep(ViewStep.ENTER_PW);
    } else {
      _onRestore(formState);
    }
  };

  return (
    <ContainerWithSubHeader title={i18n.title.importFromJson} onPressBack={_onPressBack} disabled={isBusy}>
      <View style={{ flex: 1 }}>
        {currentViewStep === ViewStep.PASTE_JSON && (
          <View style={{ ...ContainerHorizontalPadding, flex: 1, paddingTop: 26 }}>
            <InputFile onChangeResult={_onChangeFile} />
            {isFileError && (
              <Warning title={i18n.warningTitle.error} message={i18n.warningMessage.invalidJsonFile} isDanger />
            )}
            {!!formState.data.fileConfig && (
              <View style={[itemWrapperStyle, { paddingVertical: 16 }]}>
                <Text style={{ ...sharedStyles.mainText, color: ColorMap.light, ...FontMedium }}>
                  {toShort(formState.data.fileConfig, 10, 25)}
                </Text>
              </View>
            )}
          </View>
        )}

        {currentViewStep === ViewStep.ENTER_PW && (
          <View style={{ flex: 1, paddingTop: 18 }}>
            <View style={{ flexShrink: 1 }}>
              <FlatList data={accountsInfo} renderItem={renderAccount} style={ContainerHorizontalPadding} />
              <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
                <PasswordField
                  ref={formState.refs.password}
                  label={formState.labels.password}
                  defaultValue={formState.data.password}
                  onChangeText={onChangeValue('password')}
                  errorMessages={formState.errors.password}
                  onSubmitField={onSubmitField('password')}
                />
              </View>
            </View>
          </View>
        )}

        <View style={footerAreaStyle}>
          <SubmitButton
            isBusy={isBusy}
            title={currentViewStep === ViewStep.PASTE_JSON ? i18n.common.continue : i18n.common.importAccount}
            onPress={onPressSubmitButton}
            disabled={
              currentViewStep === ViewStep.PASTE_JSON
                ? !formState.data.file
                : isFileError || !formState.isValidated.password || !formState.data.password || !formState.data.file
            }
          />
        </View>
      </View>
    </ContainerWithSubHeader>
  );
};
