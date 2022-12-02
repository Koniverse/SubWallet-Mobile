import { useNavigation } from '@react-navigation/native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { AddressField } from 'components/Field/Address';
import { TextField } from 'components/Field/Text';
import { SubmitButton } from 'components/SubmitButton';
import { SCANNER_QR_STEP } from 'constants/qr';
import useGetAccountAndNetworkScanned from 'hooks/screen/Signing/useGetAccountAndNetworkScanned';
import useFormControl, { FormControlConfig, FormState } from 'hooks/screen/useFormControl';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { ScannerContext } from 'providers/ScannerContext';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import { ColorMap } from 'styles/color';
import { ContainerHorizontalPadding, FontMedium, sharedStyles } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import PasswordModal from 'components/Modal/PasswordModal';
import { Warning } from 'components/Warning';

const WrapperStyle: StyleProp<ViewStyle> = {
  ...ContainerHorizontalPadding,
};

const SubTitleTextStyle: StyleProp<TextStyle> = {
  ...sharedStyles.mainText,
  ...FontMedium,
  color: ColorMap.disabled,
  textAlign: 'center',
  marginTop: 16,
  marginBottom: 24,
};

const ActionContainerStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 16 - 4,
  display: 'flex',
  flexDirection: 'row',
  marginVertical: 16,
};

const ButtonStyle: StyleProp<ViewStyle> = {
  marginHorizontal: 4,
  flex: 1,
};

const formConfig: FormControlConfig = {
  password: {
    name: i18n.common.walletPassword,
    value: '',
    validateFunc: validatePassword,
    require: true,
  },
};

const SigningConfirm = () => {
  const navigation = useNavigation<RootNavigationProps>();

  useHandlerHardwareBackPress(true);

  const {
    cleanup,
    state: { step, type },
    signDataLegacy,
  } = useContext(ScannerContext);

  const { account, network } = useGetAccountAndNetworkScanned();
  const [isBusy, setIsBusy] = useState(false);
  const [isVisible, setVisible] = useState<boolean>(false);

  const onSubmit = (formState: FormState) => {
    const password = formState.data.password;
    setIsBusy(true);
    setVisible(false);
    signDataLegacy(false, password)
      .catch(e => {
        if (e) {
          onUpdateErrors('password')([(e as Error).message]);
        } else {
          onUpdateErrors('password')([i18n.errorMessage.unknownError]);
        }
      })
      .finally(() => {
        setIsBusy(false);
      });
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const handleChangePassword = useCallback(
    (val: string) => {
      onUpdateErrors('password')(undefined);
      onChangeValue('password')(val);
    },
    [onChangeValue, onUpdateErrors],
  );

  const onPressSubmit = () => {
    onSubmit(formState);
  };

  const goBack = useCallback(() => {
    cleanup();
    navigation.goBack();
  }, [cleanup, navigation]);

  useEffect(() => {
    if (!account) {
      cleanup();
      navigation.goBack();
    }
  }, [account, cleanup, navigation]);

  useEffect(() => {
    if (step === SCANNER_QR_STEP.FINAL_STEP) {
      navigation.navigate('SigningAction', { screen: 'SigningResult' });
    }
  }, [navigation, step]);

  return (
    <ContainerWithSubHeader
      onPressBack={goBack}
      title={type === 'message' ? i18n.title.signMessage : i18n.title.signTransaction}
      disabled={isBusy}>
      <>
        <ScrollView style={WrapperStyle}>
          <Text style={SubTitleTextStyle}>
            {type === 'message' ? i18n.signingAction.scanToSignMessage : i18n.signingAction.scanToSignTransaction}
          </Text>
          <TextField text={account?.name || ''} disabled={true} label={i18n.common.accountName} />
          <AddressField
            address={account?.address || ''}
            disableText={true}
            label={i18n.common.accountAddress}
            showRightIcon={false}
            networkPrefix={network?.ss58Format}
          />
          {!!(formState.errors.password && formState.errors.password.length) &&
            formState.errors.password.map((err: string) => {
              return <Warning message={err} isDanger />;
            })}
        </ScrollView>
        <View style={ActionContainerStyle}>
          <SubmitButton
            backgroundColor={ColorMap.dark2}
            disabledColor={ColorMap.buttonOverlayButtonColor}
            style={ButtonStyle}
            title={i18n.common.cancel}
            disabled={isBusy}
            onPress={goBack}
          />
          <SubmitButton
            style={ButtonStyle}
            title={i18n.common.approve}
            isBusy={isBusy}
            onPress={() => {
              onUpdateErrors('password')(undefined);
              setVisible(true);
            }}
          />
        </View>

        <PasswordModal
          visible={isVisible}
          closeModal={() => setVisible(false)}
          isBusy={isBusy}
          onConfirm={onPressSubmit}
          formState={formState}
          handleChangePassword={handleChangePassword}
          onSubmitField={onSubmitField('password')}
        />
      </>
    </ContainerWithSubHeader>
  );
};

export default React.memo(SigningConfirm);
