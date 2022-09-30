import React, { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { ExportPrivateKeyProps, RootNavigationProps } from 'routes/index';
import { exportAccountPrivateKey } from '../messaging';
import { PasswordField } from 'components/Field/Password';
import i18n from 'utils/i18n/i18n';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import useFormControl, { FormState } from 'hooks/screen/useFormControl';

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

const formConfig = {
  password: {
    require: true,
    name: i18n.common.passwordForThisAccount,
    value: '',
    validateFunc: validatePassword,
  },
};

export const ViewPrivateKey = ({
  route: {
    params: { address },
  },
}: ExportPrivateKeyProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const [privateKey, setPrivateKey] = useState<string>('');
  const toast = useToast();
  const [isBusy, setIsBusy] = useState(false);
  const [currentViewStep, setCurrentViewStep] = useState<number>(1);

  useEffect(() => {
    if (currentViewStep === ViewStep.ENTER_PW) {
      focus('password')();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewStep]);
  const onSetPassword = (formState: FormState) => {
    const password = formState.data.password;
    setIsBusy(true);
    exportAccountPrivateKey(address, password)
      .then(({ privateKey: resPrivateKey }) => {
        setPrivateKey(resPrivateKey);
        setIsBusy(false);
        setCurrentViewStep(ViewStep.SHOW_PK);
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
    toast.hideAll();
    toast.show(i18n.common.copiedToClipboard);
  };

  const onTapPrivate = () => {
    setCurrentViewStep(ViewStep.ENTER_PW);
  };

  const onPressDone = () => {
    navigation.goBack();
  };

  return (
    <SubScreenContainer navigation={navigation} title={i18n.title.exportPrivateKey}>
      <View style={layoutContainerStyle}>
        <ScrollView style={bodyAreaStyle}>
          <View style={warningBlockStyle}>
            <Text style={warningBlockTitleStyle}>{i18n.warningTitle.doNotSharePrivateKey}</Text>
            <Text style={warningBlockTextStyle}>{i18n.warningMessage.privateKeyWarning}</Text>
          </View>

          {currentViewStep === ViewStep.HIDE_PK && (
            <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} style={privateBlockStyle} onPress={onTapPrivate}>
              <View style={privateBlockOverlayStyle}>
                <Text style={{ ...privateBlockTextStyle, marginBottom: 4, color: ColorMap.light }}>
                  {i18n.common.tapToRevealPrivateKey}
                </Text>
                <Text style={{ ...privateBlockTextStyle, marginBottom: 8 }}>{i18n.common.viewPrivateKeyTitle}</Text>
                <View style={privateBlockIconStyle}>
                  <PrivateBlockIcon size={32} color={ColorMap.light} />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {currentViewStep === ViewStep.ENTER_PW && (
            <>
              <PasswordField
                ref={formState.refs.password}
                label={formState.labels.password}
                defaultValue={formState.data.password}
                onChangeText={onChangeValue('password')}
                errorMessages={formState.errors.password}
                onSubmitField={onSubmitField('password')}
              />
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
                title={i18n.common.copyToClipboard}
                onPress={() => copyToClipboard(privateKey)}
              />
            </View>
          )}
        </ScrollView>

        <View style={footerAreaStyle}>
          {currentViewStep === ViewStep.ENTER_PW ? (
            <SubmitButton
              title={i18n.common.continue}
              disabled={!formState.isValidated.password}
              isBusy={isBusy}
              style={buttonStyle}
              onPress={onSubmitField('password')}
            />
          ) : (
            <SubmitButton title={i18n.common.done} disabled={isBusy} style={buttonStyle} onPress={onPressDone} />
          )}
        </View>
      </View>
    </SubScreenContainer>
  );
};
