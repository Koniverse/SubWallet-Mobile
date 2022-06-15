import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { InputFile } from 'components/InputFile';
import { KeyringPair$Json } from '@polkadot/keyring/types';
import { KeyringPairs$Json } from '@polkadot/ui-keyring/types';
import { DirectoryPickerResponse, DocumentPickerResponse } from 'react-native-document-picker';
import * as RNFS from 'react-native-fs';
import { Input } from 'components/Input';
import { SubmitButton } from 'components/SubmitButton';
import { isKeyringPairs$Json } from 'types/typeGuards';
import { batchRestoreV2, jsonGetAccountInfo, jsonRestoreV2 } from '../messaging';
import { ResponseJsonGetAccountInfo } from '@subwallet/extension-base/background/types';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'types/routes';
// import RNFetchBlob from 'rn-fetch-blob';

const textStyle = {
  ...sharedStyles.mainText,
  color: ColorMap.light,
};

export const RestoreJson = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [password, setPassword] = useState<string>('');
  const [file, setFile] = useState<KeyringPair$Json | KeyringPairs$Json | undefined>(undefined);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isFileError, setFileError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [accountsInfo, setAccountsInfo] = useState<ResponseJsonGetAccountInfo[]>([]);
  const [isRestoreSuccess, setRestoreSuccess] = useState(false);

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
          .catch(e => {
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
    setRestoreSuccess(false);
    setIsPasswordError(false);
    setPassword('');
    setAccountsInfo([]);

    fileInfo = fileInfo as Array<DocumentPickerResponse>;
    const fileUri = Platform.OS === 'ios' ? decodeURIComponent(fileInfo[0].uri) : fileInfo[0].uri;

    RNFS.readFile(fileUri, 'ascii')
      .then(res => {
        _onReadFile(JSON.parse(res) as KeyringPair$Json | KeyringPairs$Json);
      })
      .catch(err => {
        setFileError(true);
        console.log('Err======', err.message, err.code);
      });
  };

  const _onRestore = () => {
    if (!file) {
      return;
    }

    if (!password) {
      return;
    }

    setIsBusy(true);

    (isKeyringPairs$Json(file)
      ? batchRestoreV2(file, password, accountsInfo, true)
      : jsonRestoreV2(file, password, accountsInfo[0].address, true)
    )
      .then(() => {
        setRestoreSuccess(true);
        setFileError(false);
        setIsBusy(false);
        setIsPasswordError(false);
        setPassword('');
        setAccountsInfo([]);
      })
      .catch(e => {
        console.log('Restore error', e);
        setIsBusy(false);
        setIsPasswordError(true);
      });
  };

  return (
    <SubScreenContainer title={'Restore JSON'} navigation={navigation}>
      <View style={sharedStyles.blockContent}>
        <InputFile onChangeResult={_onChangeFile} />
        <Input onChangeText={setPassword} value={password} secureTextEntry />
        <SubmitButton
          isBusy={isBusy}
          title={'Restore Account'}
          onPress={_onRestore}
          disabled={isFileError || isPasswordError}
        />
        {isPasswordError && <Text style={{ ...textStyle, color: ColorMap.danger }}>Error: Password Error!</Text>}
        {isFileError && <Text style={{ ...textStyle, color: ColorMap.danger }}>Error: File Error!</Text>}
        {isRestoreSuccess && <Text style={textStyle}>Info: Restore Success!</Text>}
      </View>
    </SubScreenContainer>
  );
};
