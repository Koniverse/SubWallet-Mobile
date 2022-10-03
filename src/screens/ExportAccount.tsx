import React, { useEffect, useState } from 'react';
import { ScrollView, StyleProp, View } from 'react-native';
import { SubScreenContainer } from 'components/SubScreenContainer';
import { SubmitButton } from 'components/SubmitButton';
import { CopySimple } from 'phosphor-react-native';
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
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useToast } from 'react-native-toast-notifications';
import { ExportAccountProps, RootNavigationProps } from 'routes/index';
import { exportAccount, exportAccountPrivateKey } from '../messaging';
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

const rsBlockStyle: StyleProp<any> = {
  ...sharedStyles.blockContent,
  height: 238,
  backgroundColor: ColorMap.dark2,
  marginBottom: 16,
};

// const privateBlockOverlayStyle: StyleProp<any> = {
//   flex: 1,
//   justifyContent: 'center',
// };

const rsBlockTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
};

// const privateBlockIconStyle: StyleProp<any> = {
//   alignItems: 'center',
// };

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
  SHOW_RS: 3,
};
// const PrivateBlockIcon = FingerprintSimple;

const formConfig = {
  password: {
    require: true,
    name: i18n.common.passwordForThisAccount,
    value: '',
    validateFunc: validatePassword,
  },
};

export const ExportAccount = ({
  route: {
    params: { address, exportType },
  },
}: ExportAccountProps) => {
  const navigation = useNavigation<RootNavigationProps>();
  const [result, setResult] = useState<string>('');
  const [isBusy, setIsBusy] = useState(false);
  const [currentViewStep, setCurrentViewStep] = useState<number>(2);
  const toast = useToast();

  useEffect(() => {
    if (currentViewStep === ViewStep.ENTER_PW) {
      focus('password')();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewStep]);
  const onSetPassword = (formState: FormState) => {
    const password = formState.data.password;
    setIsBusy(true);
    if (exportType === 'json') {
      exportAccount(address, password)
        .then(({ exportedJson }) => {
          setResult(JSON.stringify(exportedJson));
          setIsBusy(false);
          setCurrentViewStep(ViewStep.SHOW_RS);
        })
        .catch((error: Error) => {
          onUpdateErrors('password')([error.message]);
          setIsBusy(false);
        });
    } else {
      exportAccountPrivateKey(address, password)
        .then(({ privateKey: resPrivateKey }) => {
          setResult(resPrivateKey);
          setIsBusy(false);
          setCurrentViewStep(ViewStep.SHOW_RS);
        })
        .catch((error: Error) => {
          onUpdateErrors('password')([error.message]);
          setIsBusy(false);
        });
    }
  };
  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(formConfig, {
    onSubmitForm: onSetPassword,
  });
  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    toast.hideAll();
    toast.show(i18n.common.copiedToClipboard);
  };

  // const onTapPrivate = () => {
  //   setCurrentViewStep(ViewStep.ENTER_PW);
  // };

  const onPressDone = () => {
    navigation.goBack();
  };

  return (
    <SubScreenContainer
      navigation={navigation}
      title={exportType === 'json' ? i18n.title.exportAccount : i18n.title.yourPrivateKey}>
      <View style={layoutContainerStyle}>
        <ScrollView style={bodyAreaStyle}>
          <View style={warningBlockStyle}>
            <Text style={warningBlockTitleStyle}>
              {exportType === 'json' ? i18n.warningTitle.doNotShareJsonFile : i18n.warningTitle.doNotSharePrivateKey}
            </Text>
            <Text style={warningBlockTextStyle}>
              {exportType === 'json' ? i18n.warningMessage.exportAccountWarning : i18n.warningMessage.privateKeyWarning}
            </Text>
          </View>

          {/*{currentViewStep === ViewStep.HIDE_PK && (*/}
          {/*  <TouchableOpacity activeOpacity={BUTTON_ACTIVE_OPACITY} style={rsBlockStyle} onPress={onTapPrivate}>*/}
          {/*    <View style={privateBlockOverlayStyle}>*/}
          {/*      <Text style={{ ...rsBlockTextStyle, marginBottom: 4, color: ColorMap.light }}>*/}
          {/*        {i18n.common.tapToRevealPrivateKey}*/}
          {/*      </Text>*/}
          {/*      <Text style={{ ...rsBlockTextStyle, marginBottom: 8 }}>{i18n.common.viewPrivateKeyTitle}</Text>*/}
          {/*      <View style={privateBlockIconStyle}>*/}
          {/*        <PrivateBlockIcon size={32} color={ColorMap.light} />*/}
          {/*      </View>*/}
          {/*    </View>*/}
          {/*  </TouchableOpacity>*/}
          {/*)}*/}

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

          {currentViewStep === ViewStep.SHOW_RS && (
            <View style={rsBlockStyle}>
              <Text style={rsBlockTextStyle}>{result}</Text>
            </View>
          )}

          {currentViewStep === ViewStep.SHOW_RS && (
            <View style={copyButtonWrapperStyle}>
              <LeftIconButton
                icon={CopySimple}
                title={i18n.common.copyToClipboard}
                onPress={() => copyToClipboard(result)}
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
