import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Typography } from 'components/design-system-ui';
import {
  BackHandler,
  DeviceEventEmitter,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { PasswordField } from 'components/Field/Password';
import i18n from 'utils/i18n/i18n';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import useFormControl from 'hooks/screen/useFormControl';
import { CheckCircle } from 'phosphor-react-native';
import { keyringUnlock } from 'messaging/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyle from './style';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps, RootStackParamList, UnlockModalProps } from 'routes/index';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardVisible } from 'hooks/useKeyboardVisible';
import { setAdjustResize } from 'rn-android-keyboard-adjust';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SVGImages } from 'assets/index';
import { getKeychainPassword } from 'utils/account';
import { Portal } from '@gorhom/portal';
import { delayActionAfterDismissKeyboard } from 'utils/common/keyboard';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

type AuthMethod = 'biometric' | 'master-password';
const UNLOCK_BIOMETRY_TIMEOUT = Platform.OS === 'ios' ? 0 : 300;
export const OPEN_UNLOCK_FROM_MODAL = 'openFromModal';

async function handleUnlockPassword(
  navigation: NativeStackNavigationProp<RootStackParamList>,
  isUpdateBiometric?: boolean,
) {
  try {
    const password = await getKeychainPassword();
    if (password) {
      const unlockData = await keyringUnlock({ password });
      if (unlockData.status) {
        DeviceEventEmitter.emit('unlockModal', { type: 'onComplete', password: isUpdateBiometric ? password : '' });
        Keyboard.dismiss();
        delayActionAfterDismissKeyboard(() => navigation.goBack());
        return true;
      }
      throw 'Credential not match';
    }
    throw 'Credential not exist';
  } catch (e) {
    console.warn('Unlock failed:', e);
    return false;
  }
}
export const UnlockModal = memo(({ route: { params } }: UnlockModalProps) => {
  const { isUpdateBiometric, isConfirmation } = params;
  const { isUseBiometric } = useSelector((state: RootState) => state.mobileSettings);
  const navigation = useNavigation<RootNavigationProps>();
  const insets = useSafeAreaInsets();
  const theme = useSubWalletTheme().swThemes;
  const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible();
  const keyboardOffset = useMemo(() => {
    if (isKeyboardVisible) {
      return keyboardHeight + insets.bottom;
    } else {
      return 0;
    }
  }, [insets.bottom, isKeyboardVisible, keyboardHeight]);
  const isAndroid15 = useMemo(() => Platform.OS === 'android' && Platform.Version > 34, []);
  const styles = useMemo(() => createStyle(theme), [theme]);
  const formConfig = {
    password: {
      name: i18n.common.walletPassword,
      value: '',
      validateFunc: validatePassword,
    },
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(isUseBiometric ? 'biometric' : 'master-password');
  const [openFromModal, setOpenFromModal] = useState<boolean>(false);

  useEffect(() => {
    setAdjustResize();
    const openFromModalCallback = () => {
      setOpenFromModal(true);
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onCancelUnlock);
    const openFromModalEvent = DeviceEventEmitter.addListener(OPEN_UNLOCK_FROM_MODAL, openFromModalCallback);
    return () => {
      backHandler.remove();
      openFromModalEvent.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (authMethod === 'master-password') {
      setTimeout(() => focus('password')(), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMethod]);
  useEffect(() => {
    if (!isUseBiometric) {
      return;
    }
    setTimeout(() => {
      handleUnlockPassword(navigation, isUpdateBiometric)
        .then(result => {
          if (!result) {
            setAuthMethod('master-password');
          }
        })
        .catch(() => setAuthMethod('master-password'));
    }, UNLOCK_BIOMETRY_TIMEOUT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = () => {
    const password = formState.data.password;
    setLoading(true);
    setTimeout(() => {
      keyringUnlock({
        password,
      })
        .then(data => {
          if (!data.status) {
            onUpdateErrors('password')([i18n.errorMessage.invalidMasterPassword]);
            return;
          }
          DeviceEventEmitter.emit('unlockModal', { type: 'onComplete', password: isUpdateBiometric ? password : '' });
          Keyboard.dismiss();
          delayActionAfterDismissKeyboard(() => navigation.goBack());
        })
        .catch((e: Error) => {
          onUpdateErrors('password')([e.message]);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors, focus } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const isDisabled = useMemo(() => {
    return loading || !formState.data.password || formState.errors.password.length > 0 || authMethod === 'biometric';
  }, [formState.data.password, formState.errors.password.length, loading, authMethod]);

  const onChangePassword = useCallback(
    (value: string) => {
      if (!value) {
        onUpdateErrors('password')([i18n.warningMessage.requireMessage]);
      }
      onChangeValue('password')(value);
    },
    [onChangeValue, onUpdateErrors],
  );

  const onCancelUnlock = () => {
    DeviceEventEmitter.emit('unlockModal', { type: 'onCancel' });
    Keyboard.dismiss();
    delayActionAfterDismissKeyboard(() => navigation.goBack());
    return true;
  };

  const onTurnOnBiometric = () => {
    setAuthMethod('biometric');
    handleUnlockPassword(navigation)
      .then(result => {
        if (!result) {
          setAuthMethod('master-password');
        }
      })
      .catch(() => setAuthMethod('master-password'));
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(-keyboardOffset, { duration: 150 }) }],
  }));

  const renderMainContent = () => (
    <View style={[styles.root, Platform.OS === 'ios' ? null : styles.androidMaskModal]}>
      <TouchableOpacity activeOpacity={1} style={styles.flex1} onPress={onCancelUnlock} />
      <Animated.View style={[styles.container, isAndroid15 && isConfirmation && animatedStyle]}>
        <View style={styles.separator} />
        <View style={styles.wrapper}>
          <Typography.Text size={'lg'} style={styles.header}>
            {i18n.header.enterPassword}
          </Typography.Text>
          <PasswordField
            ref={formState.refs.password}
            label={formState.labels.password}
            defaultValue={formState.data.password}
            onChangeText={onChangePassword}
            errorMessages={formState.errors.password}
            onSubmitField={onSubmitField('password')}
          />
          <View style={styles.footer}>
            <Button
              loading={loading}
              disabled={isDisabled}
              icon={
                <Icon
                  phosphorIcon={CheckCircle}
                  size={'lg'}
                  weight={'fill'}
                  iconColor={isDisabled ? theme.colorTextLight5 : theme.colorTextLight1}
                />
              }
              onPress={onSubmit}>
              {i18n.buttonTitles.apply}
            </Button>
            {isUseBiometric && (
              <Button icon={<SVGImages.Fingerprint />} size="xs" type="ghost" onPress={onTurnOnBiometric}>
                {i18n.buttonTitles.unlockWithBiometric}
              </Button>
            )}
          </View>
          {!isKeyboardVisible && <SafeAreaView edges={['bottom']} />}
        </View>
      </Animated.View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      style={styles.flex1}>
      {Platform.OS === 'android' && openFromModal ? <Portal>{renderMainContent()}</Portal> : renderMainContent()}
    </KeyboardAvoidingView>
  );
});
