import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { ImageBackground, SafeAreaView, View } from 'react-native';
import Text from 'components/Text';
import { FontMedium, FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { PinCodeField } from 'components/PinCodeField';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { useBlurOnFulfill } from 'react-native-confirmation-code-field';
import { CELL_COUNT } from 'constants/index';
import useAppLock from 'hooks/useAppLock';
import TouchID from 'react-native-touch-id';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Images, SVGImages } from 'assets/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Button, WarningText } from 'components/design-system-ui';
import { resetWallet } from 'messaging/index';
import { useToast } from 'react-native-toast-notifications';
import { ForgotPasswordModal } from 'components/common/ForgotPasswordModal';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';

const optionalConfigObject = {
  title: 'Authentication Required', // Android
  imageColor: '#e00606', // Android
  imageErrorColor: '#ff0000', // Android
  sensorDescription: 'Touch sensor', // Android
  sensorErrorDescription: 'Failed', // Android
  cancelText: 'Cancel', // Android
  fallbackLabel: 'Enter Password', // iOS (if empty, then label is hidden)
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
};

export const LockScreen = () => {
  const theme = useSubWalletTheme().swThemes;
  const { unlock, resetPinCode } = useAppLock();
  const faceIdEnabled = useSelector((state: RootState) => state.mobileSettings.faceIdEnabled);
  const [value, setValue] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pinCode'>(faceIdEnabled ? 'biometric' : 'pinCode');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const toast = useToast();
  const [resetAccLoading, setAccLoading] = useState(false);
  const [eraseAllLoading, setEraseAllLoading] = useState(false);
  const navigation = useNavigation<RootNavigationProps>();

  const unlockWithBiometric = useAppLock().unlockWithBiometric;

  useEffect(() => {
    const _authMethod = faceIdEnabled ? 'biometric' : 'pinCode';
    if (_authMethod === 'biometric') {
      TouchID.isSupported()
        .then(currentType => {
          TouchID.authenticate(`Sign in with ${currentType}`, optionalConfigObject)
            .then(() => {
              unlockWithBiometric();
              navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home');
            })
            .catch(() => {
              setAuthMethod('pinCode');
            });
        })
        .catch(() => setAuthMethod('pinCode'));
    }
    setAuthMethod(_authMethod);
  }, [faceIdEnabled, navigation, unlockWithBiometric]);

  useEffect(() => {
    if (value.length === 6) {
      if (unlock(value)) {
        setValue('');
        navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home');
      } else {
        setValue('');
        setError(i18n.errorMessage.invalidPinCode);
        ref.current?.focus();
      }
    }
  }, [navigation, ref, unlock, value]);

  const onReset = useCallback(
    (resetAll: boolean) => {
      return () => {
        const _setLoading = resetAll ? setEraseAllLoading : setAccLoading;
        _setLoading(true);

        setTimeout(() => {
          _setLoading(false);
          resetWallet({
            resetAll: resetAll,
          })
            .then(rs => {
              if (!rs.status) {
                toast.show(rs.errors[0], { type: 'danger' });
              }
              resetPinCode();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            })
            .catch((e: Error) => {
              toast.show(e.message, { type: 'danger' });
            })
            .finally(() => {
              _setLoading(false);
              setModalVisible(false);
            });
        }, 300);
      };
    },
    [navigation, resetPinCode, toast],
  );

  return (
    <View
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
        backgroundColor: ColorMap.dark1,
      }}>
      <ImageBackground source={Images.backgroundImg} resizeMode={'cover'} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{ ...sharedStyles.layoutContainer, flex: 1, width: '100%', alignItems: 'center', paddingTop: 68 }}>
            <Suspense>
              <SVGImages.LogoGradient width={80} height={120} />
            </Suspense>

            <Text
              style={{
                fontSize: 24,
                lineHeight: 32,
                ...FontSemiBold,
                color: ColorMap.light,
                paddingTop: 32,
                paddingBottom: 8,
              }}>
              {i18n.welcomeScreen.welcomeBackTitle}
            </Text>
            {authMethod === 'pinCode' && (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 22,
                    ...FontMedium,
                    color: theme.colorTextLight4,
                    paddingBottom: 12,
                  }}>
                  {i18n.common.enterPinToUnlock}
                </Text>
                <PinCodeField
                  value={value}
                  setError={setError}
                  setValue={setValue}
                  isPinCodeValid={!error}
                  pinCodeRef={ref}
                />
              </>
            )}

            {!!error && <WarningText isDanger message={error} style={{ marginTop: 24 }} />}

            <Button type={'ghost'} onPress={() => setModalVisible(true)}>
              {i18n.welcomeScreen.forgetAccount}
            </Button>

            <ForgotPasswordModal
              modalVisible={modalVisible}
              onReset={onReset}
              onCloseModalVisible={() => setModalVisible(false)}
              resetAccLoading={resetAccLoading}
              eraseAllLoading={eraseAllLoading}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};
