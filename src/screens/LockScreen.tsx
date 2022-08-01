import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import Text from 'components/Text';
import { FontBold, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { PinCodeField } from 'components/PinCodeField';
import { Warning } from 'components/Warning';
import { ColorMap } from 'styles/color';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import i18n from 'utils/i18n/i18n';
import { useBlurOnFulfill } from 'react-native-confirmation-code-field';
import { CELL_COUNT } from '../constant';

export const LockScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const {
    settingData: { pinCode },
    accounts: { accounts },
  } = useSelector((state: RootState) => state);
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      ref && ref.current && ref.current.focus();
    });

    return unsubscribe;
  }, [navigation, ref]);

  useEffect(() => {
    if (value.length > 5) {
      if (value === pinCode) {
        setValue('');
        if (accounts && accounts.length) {
          navigation.navigate('Home');
        } else {
          navigation.navigate('FirstScreen');
        }
      } else {
        setError('Wrong password');
      }
    } else {
      setError('');
    }
  }, [accounts, navigation, pinCode, value]);

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
