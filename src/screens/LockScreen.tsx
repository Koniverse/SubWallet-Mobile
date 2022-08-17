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

export const LockScreen = ({ navigation }: NavigationProps) => {
  const { unlock } = useAppLock();
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });

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
        <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled, paddingBottom: 77 }}>
          {i18n.common.enterPinToUnlock}
        </Text>
        <PinCodeField value={value} setValue={setValue} isPinCodeValid={!error} pinCodeRef={ref} />

        {!!error && <Warning style={{ marginTop: 16 }} isDanger message={error} />}
      </View>
    </SafeAreaView>
  );
};
