import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Typography } from 'components/design-system-ui';
import { DeviceEventEmitter, KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { PasswordField } from 'components/Field/Password';
import i18n from 'utils/i18n/i18n';
import { validatePassword } from 'screens/Shared/AccountNamePasswordCreation';
import useFormControl from 'hooks/screen/useFormControl';
import { CheckCircle } from 'phosphor-react-native';
import { keyringUnlock } from 'messaging/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStyle from './style';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeyboardVisible } from 'hooks/useKeyboardVisible';
import { setAdjustResize } from 'rn-android-keyboard-adjust';

export const UnlockModal = () => {
  const navigation = useNavigation<RootNavigationProps>();
  const theme = useSubWalletTheme().swThemes;
  const { isKeyboardVisible } = useKeyboardVisible();
  useEffect(() => setAdjustResize(), []);

  const styles = useMemo(() => createStyle(theme), [theme]);

  const formConfig = {
    password: {
      name: i18n.common.walletPassword,
      value: '',
      validateFunc: validatePassword,
    },
  };

  const [loading, setLoading] = useState<boolean>(false);

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
          } else {
            DeviceEventEmitter.emit('unlockModal', { type: 'onComplete' });
            navigation.goBack();
          }
        })
        .catch((e: Error) => {
          onUpdateErrors('password')([e.message]);
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  const { formState, onChangeValue, onSubmitField, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const isDisabled = useMemo(() => {
    return loading || !formState.data.password || formState.errors.password.length > 0;
  }, [formState.data.password, formState.errors.password.length, loading]);

  const onChangePassword = useCallback(
    (value: string) => {
      if (!value) {
        onUpdateErrors('password')([i18n.warningMessage.requireMessage]);
      }
      onChangeValue('password')(value);
    },
    [onChangeValue, onUpdateErrors],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      style={{ flex: 1 }}>
      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={() => {
            DeviceEventEmitter.emit('unlockModal', { type: 'onCancel' });
            navigation.goBack();
          }}
        />
        <View style={styles.container}>
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
              isBusy={loading}
              autoFocus
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
            </View>
            {!isKeyboardVisible && <SafeAreaView edges={['bottom']} />}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
