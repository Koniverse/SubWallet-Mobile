import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { FontBold, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { PinCodeField } from 'components/PinCodeField';
import { Warning } from 'components/Warning';
import { ColorMap } from 'styles/color';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';

export const LockScreen = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const {
    settingData: { pinCode },
    accounts: { accounts },
  } = useSelector((state: RootState) => state);
  const [value, setValue] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (value.length > 5) {
      if (value === pinCode) {
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
          Welcome Back!
        </Text>
        <Text style={{ ...sharedStyles.mainText, ...FontMedium, color: ColorMap.disabled, paddingBottom: 77 }}>
          Enter the PIN to unlock
        </Text>
        <PinCodeField value={value} setValue={setValue} isPinCodeValid={!error} />

        {!!error && <Warning style={{ marginTop: 16 }} isDanger message={error} />}
      </View>
    </SafeAreaView>
  );
};
