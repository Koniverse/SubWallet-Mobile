import React, { Suspense, useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
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
import { SVGImages } from 'assets/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { WarningText } from 'components/design-system-ui';

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
  const { unlock } = useAppLock();
  const faceIdEnabled = useSelector((state: RootState) => state.mobileSettings.faceIdEnabled);
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pinCode'>(faceIdEnabled ? 'biometric' : 'pinCode');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });

  const unlockWithBiometric = useAppLock().unlockWithBiometric;

  useEffect(() => {
    const _authMethod = faceIdEnabled ? 'biometric' : 'pinCode';
    if (_authMethod === 'biometric') {
      TouchID.isSupported()
        .then(currentType => {
          TouchID.authenticate(`Sign in with ${currentType}`, optionalConfigObject)
            .then(() => {
              unlockWithBiometric();
            })
            .catch(() => {
              setAuthMethod('pinCode');
            });
        })
        .catch(() => setAuthMethod('pinCode'));
    } else {
      ref.current?.focus();
    }

    setAuthMethod(_authMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceIdEnabled, unlockWithBiometric]);

  useEffect(() => {
    if (value.length === 6) {
      if (unlock(value)) {
        setValue('');
      } else {
        setValue('');
        setError(i18n.errorMessage.invalidPinCode);
        ref.current?.focus();
      }
    }
  }, [ref, unlock, value]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C0C0C' }}>
      <View style={{ ...sharedStyles.layoutContainer, flex: 1, width: '100%', alignItems: 'center', paddingTop: 68 }}>
        <Suspense>
          <SVGImages.Logo width={80} height={120} />
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
          {i18n.common.welcomeBack}
        </Text>
        {authMethod === 'pinCode' && (
          <>
            <Text
              style={{ fontSize: 14, lineHeight: 22, ...FontMedium, color: theme.colorTextLight4, paddingBottom: 12 }}>
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
      </View>
    </SafeAreaView>
  );
};
