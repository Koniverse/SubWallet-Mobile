import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import Text from 'components/Text';
import { FontBold, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { PinCodeField } from 'components/PinCodeField';
import { Warning } from 'components/Warning';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import { useBlurOnFulfill } from 'react-native-confirmation-code-field';
import { CELL_COUNT } from '../constant';
import useAppLock from 'hooks/useAppLock';
import { NavigationProps } from 'types/routes';
import { useIsFocused } from '@react-navigation/native';
import TouchID from 'react-native-touch-id';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

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

export const LockScreen = ({ navigation }: NavigationProps) => {
  const { unlock } = useAppLock();
  const faceIdEnabled = useSelector((state: RootState) => state.mobileSettings.faceIdEnabled);
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pinCode'>(faceIdEnabled ? 'biometric' : 'pinCode');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });

  const unlockWithBiometric = useAppLock().unlockWithBiometric;
  const isFocused = useIsFocused();

  useEffect(() => {
    const _authMethod = faceIdEnabled ? 'biometric' : 'pinCode';
    if (isFocused) {
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
    }
    setAuthMethod(_authMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceIdEnabled, isFocused, navigation, unlockWithBiometric]);

  useEffect(() => {
    if (value.length === 6) {
      if (unlock(value)) {
        setValue('');
      } else {
        setError(i18n.errorMessage.wrongPassword);
      }
    } else {
      setError('');
    }
  }, [navigation, unlock, value]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ ...sharedStyles.layoutContainer, flex: 1, width: '100%', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 32,
            lineHeight: 40,
            ...FontBold,
            color: ColorMap.light,
            paddingTop: 80,
            paddingBottom: 11,
          }}>
          {i18n.common.welcomeBack}
        </Text>
        {authMethod === 'pinCode' && (
          <>
            <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled, paddingBottom: 77 }}>
              {i18n.common.enterPinToUnlock}
            </Text>
            <PinCodeField value={value} setValue={setValue} isPinCodeValid={!error} pinCodeRef={ref} />
          </>
        )}

        {!!error && <Warning style={{ marginTop: 16 }} isDanger message={error} />}
      </View>
    </SafeAreaView>
  );
};
