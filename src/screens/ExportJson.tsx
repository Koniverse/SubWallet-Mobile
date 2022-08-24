import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleProp, View } from 'react-native';
import { SubmitButton } from 'components/SubmitButton';
import Text from '../components/Text';
import { ColorMap } from 'styles/color';
import { FontMedium, FontSemiBold, ScrollViewStyle, sharedStyles, STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import { PasswordField } from 'components/Field/Password';
import { Warning } from 'components/Warning';
import { exportAccount } from '../messaging';
import { LeftIconButton } from 'components/LeftIconButton';
import { CopySimple } from 'phosphor-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-notifications';
import { deviceHeight, HIDE_MODAL_DURATION } from '../constant';
import i18n from 'utils/i18n/i18n';
import ToastContainer from 'react-native-toast-notifications';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';

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

const OFFSET_BOTTOM = deviceHeight - STATUS_BAR_HEIGHT - 140;

const formConfig = {
  password: {
    require: true,
    name: i18n.common.passwordForThisAccount.toUpperCase(),
    value: '',
    validateFunc: validatePassword,
  },
};

export const ExportJson = ({ address, closeModal }: Props) => {
  const [isBusy, setIsBusy] = useState(false);
  const [fileContent, setFileContent] = useState('');
  const toastRef = useRef<ToastContainer>(null);

  useEffect(() => {
    setTimeout(() => {
      focus('password')();
    }, HIDE_MODAL_DURATION);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSetPassword = (formState: FormState) => {
    const password = formState.data.password;
    setIsBusy(true);
    exportAccount(address, password)
      .then(({ exportedJson }) => {
        setFileContent(JSON.stringify(exportedJson));
        setIsBusy(false);
      })
      .catch((error: Error) => {
        onUpdateErrors('password')([error.message]);
        setIsBusy(false);
      });
  };
  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(formConfig, {
    onSubmitForm: onSetPassword,
  });

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    if (toastRef.current) {
      // @ts-ignore
      toastRef.current.hideAll();
      // @ts-ignore
      toastRef.current.show(i18n.common.copiedToClipboard);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={18}>
      <SafeAreaView
        style={{
          backgroundColor: ColorMap.dark2,
          height: '100%',
          width: '100%',
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

          <View style={bodyAreaStyle}>
            <Warning
              title={i18n.warningTitle.doNotShareJsonFile}
              message={i18n.warningMessage.exportAccountWarning}
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
                    title={i18n.common.copyToClipboard}
                    onPress={() => copyToClipboard(fileContent)}
                  />
                </View>
              </>
            )}

            {!fileContent && (
              <PasswordField
                ref={formState.refs.password}
                label={formState.labels.password}
                onChangeText={onChangeValue('password')}
                onBlur={() => onSetPassword(formState)}
                onEndEditing={() => onSetPassword(formState)}
                errorMessages={formState.errors.password}
                style={passwordFieldStyle}
                onSubmitField={onSubmitField('password')}
              />
            )}
          </View>
          <View style={footerAreaStyle}>
            <SubmitButton
              title={fileContent ? i18n.common.done : i18n.common.continue}
              disabled={!formState.isValidated.password}
              isBusy={isBusy}
              style={buttonStyle}
              onPress={fileContent ? () => closeModal(false) : () => onSetPassword(formState)}
            />
          </View>

          {
            <Toast
              duration={1500}
              normalColor={ColorMap.notification}
              ref={toastRef}
              placement={'bottom'}
              offsetBottom={OFFSET_BOTTOM}
            />
          }
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
