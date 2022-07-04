import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleProp, Text, View } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { FontSemiBold, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { useToast } from 'react-native-toast-notifications';
import { PasswordField } from 'components/Field/Password';
import { Warning } from 'components/Warning';
import { exportAccount } from '../messaging';
import * as RNFS from 'react-native-fs';

interface Props {
  address: string;
  closeModal: (isShowModal: boolean) => void;
}

const layoutContainerStyle: StyleProp<any> = {
  flex: 1,
};

const bodyAreaStyle: StyleProp<any> = {
  flex: 1,
  ...ScrollViewStyle,
};

const footerAreaStyle: StyleProp<any> = {
  flexDirection: 'row',
  marginBottom: 40,
};

const passwordFieldStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  borderRadius: 5,
  marginBottom: 8,
};

const buttonStyle: StyleProp<any> = {
  width: '100%',
};

export const ExportJson = ({ address, closeModal }: Props) => {
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
        const baseDir = Platform.OS === 'android' ? RNFS.DownloadDirectoryPath : RNFS.DocumentDirectoryPath;

        const filePath = baseDir + `/${exportedJson.address}.json`;

        RNFS.writeFile(filePath, JSON.stringify(exportedJson), 'utf8')
          .then(success => {
            console.log('FILE WRITTEN!', success);
            toast.show('Export successfully');
            setIsBusy(false);
            closeModal(false);
          })
          .catch(err => {
            setErrorMessage(err.error);
            setIsBusy(false);
          });
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setIsBusy(false);
      });
  };

  const isPasswordError = !password || password.length < 6;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={18}>
      <SafeAreaView
        style={{
          backgroundColor: ColorMap.dark2,
          height: '100%',
        }}>
        <View style={layoutContainerStyle}>
          <Text
            style={{
              textAlign: 'center',
              color: ColorMap.light,
              ...sharedStyles.mediumText,
              ...FontSemiBold,
              paddingBottom: 16,
            }}>
            Export Account
          </Text>

          <ScrollView style={bodyAreaStyle}>
            <Warning
              title={'Do not share your private key!'}
              message={'If someone has your private key they will have full control of your account'}
              style={{ marginBottom: 16 }}
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
              <Warning isDanger style={{ ...sharedStyles.mainText, marginTop: 0 }} message={errorMessage} />
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
