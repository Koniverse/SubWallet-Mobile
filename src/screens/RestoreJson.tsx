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
// import RNFetchBlob from 'rn-fetch-blob';

export const RestoreJson = () => {
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

  console.log('123123123123', password);
  console.log('accountsInfo00000', accountsInfo);

  return (
    <View>
      <InputFile onChangeResult={_onChangeFile} />
      <Input onChangeText={setPassword} value={password} secureTextEntry />
      <SubmitButton
        isBusy={isBusy}
        title={'Restore Account'}
        onPress={_onRestore}
        disabled={isFileError || isPasswordError}
      />
      {isPasswordError && <Text>Error: Password Error!</Text>}
      {isFileError && <Text>Error: File Error!</Text>}
      {isRestoreSuccess && <Text>Info: Restore Success!</Text>}
    </View>
  );
};
