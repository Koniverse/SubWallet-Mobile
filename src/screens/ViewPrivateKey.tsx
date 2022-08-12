import React, { useState } from 'react';
import { ScrollView, StyleProp, TouchableOpacity, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { SubmitButton } from 'components/SubmitButton';
import { CopySimple, FingerprintSimple } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import Text from '../components/Text';
import {
  ContainerHorizontalPadding,
  FontBold,
  FontMedium,
  MarginBottomForSubmitButton,
  ScrollViewStyle,
  sharedStyles,
} from 'styles/sharedStyles';
import { LeftIconButton } from 'components/LeftIconButton';
import { BUTTON_ACTIVE_OPACITY } from '../constant';
import { useNavigation, useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { RootNavigationProps } from 'types/routes';
import { exportAccountPrivateKey } from '../messaging';
import { RootRouteProps } from 'types/routes';
import { PasswordField } from 'components/Field/Password';
import { Warning } from 'components/Warning';

const layoutContainerStyle: StyleProp<any> = {
  ...ContainerHorizontalPadding,
  flex: 1,
  marginTop: 8,
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

const warningBlockStyle: StyleProp<any> = {
  ...sharedStyles.blockContent,
  backgroundColor: ColorMap.warningOverlay,
  paddingBottom: 14,
  paddingTop: 17,
  marginBottom: 16,
};

const warningBlockTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.warning,
  textAlign: 'center',
};

const warningBlockTitleStyle: StyleProp<any> = {
  ...warningBlockTextStyle,
  ...FontBold,
  marginBottom: 8,
};

const privateBlockStyle: StyleProp<any> = {
  ...sharedStyles.blockContent,
  height: 238,
  backgroundColor: ColorMap.dark2,
  marginBottom: 16,
};

const privateBlockOverlayStyle: StyleProp<any> = {
  flex: 1,
  justifyContent: 'center',
};

const privateBlockTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
};

const privateBlockIconStyle: StyleProp<any> = {
  alignItems: 'center',
};

const copyButtonWrapperStyle: StyleProp<any> = {
  alignItems: 'center',
};

const buttonStyle: StyleProp<any> = {
  margin: 4,
  flex: 1,
};

const ViewStep = {
  HIDE_PK: 1,
  ENTER_PW: 2,
  SHOW_PK: 3,
};
const PrivateBlockIcon = FingerprintSimple;

export const ViewPrivateKey = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const route = useRoute<RootRouteProps>();
  const [privateKey, setPrivateKey] = useState<string>('');
  const toast = useToast();
  const [password, setPassword] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentViewStep, setCurrentViewStep] = useState<number>(1);
  // @ts-ignore
  const { address } = route.params;
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    toast.hideAll();
    toast.show('Copied to Clipboard');
  };

  const onTapPrivate = () => {
    setCurrentViewStep(ViewStep.ENTER_PW);
  };

  const onTypePassword = (pass: string) => {
    setPassword(pass);
    setErrorMessage('');
  };

  const onSetPassword = () => {
    setIsBusy(true);
    exportAccountPrivateKey(address, password)
      .then(({ privateKey: resPrivateKey }) => {
        setPrivateKey(resPrivateKey);
        setIsBusy(false);
        setCurrentViewStep(ViewStep.SHOW_PK);
      })
      .catch((error: Error) => {
        setErrorMessage(error.message);
        setIsBusy(false);
      });
  };

  const onPressDone = () => {
    navigation.goBack();
  };

  const isPasswordError = !password || password.length < 6;

  return (
    <SubScreenContainer navigation={navigation} title={'Your Private Key'}>
      <View style={layoutContainerStyle}>
        <ScrollView style={bodyAreaStyle}>
          <View style={warningBlockStyle}>
            <Text style={warningBlockTitleStyle}>Do not share your private key!</Text>
            <Text style={warningBlockTextStyle}>
              If someone has your private key they will have full control of your account
            </Text>
          </View>

          {currentViewStep === ViewStep.HIDE_PK && (
            <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} style={privateBlockStyle} onPress={onTapPrivate}>
              <View style={privateBlockOverlayStyle}>
                <Text style={{ ...privateBlockTextStyle, marginBottom: 4, color: ColorMap.light }}>
                  Tap to reveal your private key
                </Text>
                <Text style={{ ...privateBlockTextStyle, marginBottom: 8 }}>
                  Make sure no one is watching your screen
                </Text>
                <View style={privateBlockIconStyle}>
                  <PrivateBlockIcon size={32} color={ColorMap.light} />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {currentViewStep === ViewStep.ENTER_PW && (
            <>
              <PasswordField
                label={'password for this account'}
                onChangeText={onTypePassword}
                isError={isPasswordError}
                value={password}
              />

              {!!errorMessage && (
                <Warning isDanger style={{ ...sharedStyles.mainText, marginTop: 10 }} message={errorMessage} />
              )}
            </>
          )}

          {currentViewStep === ViewStep.SHOW_PK && (
            <View style={privateBlockStyle}>
              <Text style={privateBlockTextStyle}>{privateKey}</Text>
            </View>
          )}

          {currentViewStep === ViewStep.SHOW_PK && (
            <View style={copyButtonWrapperStyle}>
              <LeftIconButton
                icon={CopySimple}
                title={'Copy to Clipboard'}
                onPress={() => copyToClipboard(privateKey)}
              />
            </View>
          )}
        </ScrollView>

        <View style={footerAreaStyle}>
          {currentViewStep === ViewStep.ENTER_PW ? (
            <SubmitButton
              title={'Continue'}
              disabled={isPasswordError}
              isBusy={isBusy}
              style={buttonStyle}
              onPress={onSetPassword}
            />
          ) : (
            <SubmitButton title={'Done'} disabled={isBusy} style={buttonStyle} onPress={onPressDone} />
          )}
        </View>
      </View>
    </SubScreenContainer>
  );
};
