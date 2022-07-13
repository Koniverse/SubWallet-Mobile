import React, { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleProp, Text, View } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { PasswordField } from 'components/Field/Password';
import { Warning } from 'components/Warning';
import { exportAccount } from '../messaging';
import { LeftIconButton } from 'components/LeftIconButton';
import { CopySimple } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';

interface Props {
  address: string;
  closeModal: (isShowModal: boolean) => void;
}

const layoutContainerStyle: StyleProp<any> = {
  flex: 1,
  position: 'relative',
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

const privateBlockStyle: StyleProp<any> = {
  ...sharedStyles.blockContent,
  backgroundColor: ColorMap.dark1,
  marginBottom: 16,
};

const privateBlockTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
};

const buttonStyle: StyleProp<any> = {
  width: '100%',
};

export const ExportJson = ({ address, closeModal }: Props) => {
  const [password, setPassword] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [isShowToast, setShowToast] = useState(false);

  const onTypePassword = (pass: string) => {
    setPassword(pass);
    setErrorMessage('');
  };

  const onSetPassword = () => {
    setIsBusy(true);
    exportAccount(address, password)
      .then(({ exportedJson }) => {
        setFileContent(JSON.stringify(exportedJson));
        setIsBusy(false);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setIsBusy(false);
      });
  };

  const copyToClipboard = useCallback((text: string) => {
    Clipboard.setString(text);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1000);
  }, []);

  const isPasswordError = !password || password.length < 6;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={18}>
      <SafeAreaView
        style={{
          backgroundColor: ColorMap.dark2,
          height: '100%',
          width: '100%',
        }}>
        <View style={layoutContainerStyle}>
          {isShowToast && (
            <View
              style={{
                position: 'absolute',
                top: 25,
                left: 0,
                right: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View style={{ backgroundColor: ColorMap.notification, padding: 5, borderRadius: 5 }}>
                <Text style={{ color: ColorMap.light }}>Copied to Clipboard</Text>
              </View>
            </View>
          )}
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

          <View style={bodyAreaStyle}>
            <Warning
              title={'Do not share your private key!'}
              message={'If someone has your private key they will have full control of your account'}
              style={{ marginBottom: 16 }}
            />

            {!!fileContent && (
              <>
                <View style={privateBlockStyle}>
                  <Text style={privateBlockTextStyle} numberOfLines={4}>
                    {fileContent}
                  </Text>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <LeftIconButton
                    icon={CopySimple}
                    title={'Copy to Clipboard'}
                    onPress={() => copyToClipboard(fileContent)}
                  />
                </View>
              </>
            )}

            {!fileContent && (
              <PasswordField
                label={'PASSWORD FOR THIS ACCOUNT'}
                onChangeText={onTypePassword}
                onBlur={onSetPassword}
                onEndEditing={onSetPassword}
                isError={isPasswordError}
                value={password}
                style={passwordFieldStyle}
              />
            )}

            {!!errorMessage && (
              <Warning isDanger style={{ ...sharedStyles.mainText, marginTop: 0 }} message={errorMessage} />
            )}
          </View>
          <View style={footerAreaStyle}>
            <SubmitButton
              title={!!fileContent ? 'Done' : 'Continue'}
              disabled={isPasswordError}
              isBusy={isBusy}
              style={buttonStyle}
              onPress={!!fileContent ? () => closeModal(false) : onSetPassword}
            />
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
