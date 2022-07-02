import React, { useState } from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import {
  ContainerHorizontalPadding,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { useToast } from 'react-native-toast-notifications';
import { PasswordField } from 'components/Field/Password';
import { Warning } from 'components/Warning';
import { exportAccount } from '../messaging';
import * as RNFS from 'react-native-fs';

interface Props {
  address: string;
}

const layoutContainerStyle: StyleProp<any> = {
  ...ContainerHorizontalPadding,
  flex: 1,
};

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  ...ScrollViewStyle,
};

const footerAreaStyle: StyleProp<any> = {
  marginLeft: -4,
  marginRight: -4,
  flexDirection: 'row',
  paddingTop: 12,
  ...MarginBottomForSubmitButton,
};

const passwordFieldStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  borderRadius: 5,
};

const buttonStyle: StyleProp<any> = {
  margin: 4,
  flex: 1,
};

export const ExportJson = ({ address }: Props) => {
  const toast = useToast();
  const [password, setPassword] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onTypePassword = (pass: string) => {
    setPassword(pass);
    setErrorMessage('');
  };

  const onSetPassword = () => {
    setIsBusy(true);
    exportAccount(address, password)
      .then(({ exportedJson }) => {
        console.log('exportedJson', exportedJson);

        const filePath = RNFS.DownloadDirectoryPath + `/${exportedJson.address}.json`;

        RNFS.writeFile(filePath, JSON.stringify(exportedJson), 'utf8')
          .then(success => {
            console.log('FILE WRITTEN!', success);
            toast.show('Export successfully');
            setIsBusy(false);
          })
          .catch(err => {
            console.log(err.message);
            setIsBusy(false);
          });
      })
      .catch((error: Error) => {
        console.log('error----', error);
        setIsBusy(false);
      });
  };

  const isPasswordError = !password || password.length < 6;

  return (
    <View style={{ flex: 1, backgroundColor: ColorMap.dark2 }}>
      <View style={layoutContainerStyle}>
        <ScrollView style={bodyAreaStyle}>
          <Warning
            title={'Do not share your private key!'}
            message={'If someone has your private key they will have full control of your account'}
          />

          <PasswordField
            label={'PASSWORD FOR THIS ACCOUNT'}
            onChangeText={onTypePassword}
            onBlur={onSetPassword}
            onEndEditing={onSetPassword}
            isError={isPasswordError}
            value={password}
            style={passwordFieldStyle}
          />

          {!!errorMessage && (
            <Warning isDanger style={{ ...sharedStyles.mainText, marginTop: 10 }} message={errorMessage} />
          )}
        </ScrollView>

        <View style={footerAreaStyle}>
          <SubmitButton
            title={'Continue'}
            disabled={isPasswordError}
            isBusy={isBusy}
            style={buttonStyle}
            onPress={onSetPassword}
          />
        </View>
      </View>
    </View>
  );
};
