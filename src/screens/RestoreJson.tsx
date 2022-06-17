import React, { useState } from 'react';
import { Platform, StyleProp, View } from 'react-native';
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
import { sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { RootNavigationProps } from 'types/routes';
import { PasswordInput } from 'components/PasswordInput';
import { Warning } from 'components/Warning';
// import RNFetchBlob from 'rn-fetch-blob';

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  paddingTop: 8,
};

const footerAreaStyle: StyleProp<any> = {
  paddingTop: 12,
  paddingBottom: 22,
};

export const RestoreJson = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const [password, setPassword] = useState<string>('');
  const [file, setFile] = useState<KeyringPair$Json | KeyringPairs$Json | undefined>(undefined);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [isFileError, setFileError] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [accountsInfo, setAccountsInfo] = useState<ResponseJsonGetAccountInfo[]>([]);

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
        setFileError(false);
        setIsBusy(false);
        setIsPasswordError(false);
        setPassword('');
        setAccountsInfo([]);
        navigation.navigate('Home');
      })
      .catch(e => {
        console.log('Restore error', e);
        setIsBusy(false);
        setIsPasswordError(true);
      });
  };

  return (
    <SubScreenContainer title={'Restore JSON'} navigation={navigation}>
      <View style={[sharedStyles.blockContent, { flex: 1 }]}>
        <View style={bodyAreaStyle}>
          <InputFile onChangeResult={_onChangeFile} />
          <PasswordInput
            label={'Wallet Password'}
            containerStyle={{ backgroundColor: ColorMap.dark2, marginBottom: 8 }}
            onChangeText={setPassword}
            value={password}
          />
          {isPasswordError && (
            <Warning
              messageTitle={'Error!'}
              warningMessage={'Unable to decode using the supplied passphrase'}
              isDanger
            />
          )}
          {isFileError && <Warning messageTitle={'Error!'} warningMessage={'Invalid Json file'} isDanger />}
        </View>

        <View style={footerAreaStyle}>
          <SubmitButton
            isBusy={isBusy}
            title={'Import an Account'}
            onPress={_onRestore}
            disabled={isFileError || isPasswordError || !password || !file}
          />
        </View>
      </View>
    </SubScreenContainer>
  );
};
