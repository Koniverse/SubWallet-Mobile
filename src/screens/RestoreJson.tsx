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

const footerAreaStyle: StyleProp<any> = {
  marginTop: 8,
  marginHorizontal: 16,
  ...MarginBottomForSubmitButton,
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
    setAccountsInfo(() => []);

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

  const _onRestore = useCallback(() => {
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
        setAccountsInfo(() => []);
        navigation.navigate('Home');
      })
      .catch(e => {
        console.log('Restore error', e);
        setIsBusy(false);
        setIsPasswordError(true);
      });
  }, [accountsInfo, file, navigation, password]);

  const onChangeText = (text: string) => {
    setFileError(false);
    setIsPasswordError(false);
    setPassword(text);
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
    <SubScreenContainer title={'Restore JSON'} navigation={navigation}>
      <View style={{ flex: 1 }}>
        <ScrollView style={{ ...sharedStyles.layoutContainer }}>
          <InputFile onChangeResult={_onChangeFile} />
          {renderAccount()}
          <PasswordField
            label={'Wallet Password'}
            onChangeText={onChangeText}
            value={password}
            isError={!!password && password.length < 6}
          />
          {isPasswordError && <Warning message={'Unable to decode using the supplied passphrase'} isDanger />}
          {isFileError && <Warning title={'Error!'} message={'Invalid Json file'} isDanger />}
        </ScrollView>

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
