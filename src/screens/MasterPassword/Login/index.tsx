import { Button, Typography } from 'components/design-system-ui';
import useFormControl from 'hooks/screen/useFormControl';
import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import {
  DeviceEventEmitter,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import i18n from 'utils/i18n/i18n';
import { keyringLock, keyringUnlock, resetWallet } from 'messaging/index';
import { Images, SVGImages } from 'assets/index';
import { InlinePassword } from 'components/common/Field/Password';
import createStyles from './styles';
import useAppLock from 'hooks/useAppLock';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForgotPasswordModal } from 'components/common/ForgotPasswordModal';
import { useToast } from 'react-native-toast-notifications';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import {
  createKeychainPassword,
  getKeychainPassword,
  getSupportedBiometryType,
  resetKeychainPassword,
} from 'utils/account';
import { updateFaceIdEnable, updateUseBiometric } from 'stores/MobileSettings';
import { FORCE_HIDDEN_EVENT } from 'components/design-system-ui/modal/ModalBaseV2';
import MigrateToKeychainPasswordModal from '../MigrateToKeychainPasswordModal';
import { mmkvStore } from 'utils/storage';
import { setBuildNumber } from 'stores/AppVersion';
import { LockTimeout } from 'stores/types';

interface LoginProps {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}
type AuthMethod = 'biometric' | 'master-password';

const imageBackgroundStyle: StyleProp<any> = {
  flex: 1,
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingBottom: Platform.OS === 'ios' ? 56 : 20,
  position: 'relative',
  backgroundColor: 'black',
};
// on Android, react navigation modal stacks doesn't in root level, it could be overlap
function forceCloseModalV2(isForceClose: boolean) {
  if (Platform.OS === 'android') {
    DeviceEventEmitter.emit(FORCE_HIDDEN_EVENT, isForceClose);
  }
}
// Deprecated: This key only exist in keychain version
const isKeychainEnabled = mmkvStore.getBoolean('isKeychainEnabled');
const BEFORE_KEYCHAIN_BUILD_NUMBER = 211;

const Login: React.FC<LoginProps> = ({ navigation }) => {
  const { faceIdEnabled, isUseBiometric, timeAutoLock } = useSelector((state: RootState) => state.mobileSettings);
  const { buildNumber } = useSelector((state: RootState) => state.appVersion);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMigrateVisible, setModalMigrateVisible] = useState<boolean>(false);
  const [resetAccLoading, setAccLoading] = useState(false);
  const [eraseAllLoading, setEraseAllLoading] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(isUseBiometric);
  const dispatch = useDispatch();

  const toast = useToast();
  const [authMethod, setAuthMethod] = useState<AuthMethod>(isUseBiometric ? 'biometric' : 'master-password');
  const styles = createStyles();
  const { unlockApp, resetPinCode } = useAppLock();
  const formConfig = {
    password: {
      name: i18n.common.walletPassword,
      value: '',
      require: false,
    },
  };
  useHandlerHardwareBackPress(true);

  const onUnlock = useCallback((password: string) => {
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
          unlockApp();
          if (faceIdEnabled && !isUseBiometric) {
            // Deprecated: Migrate use biometrics
            createKeychainPassword(password)
              .then(res => {
                if (res) {
                  dispatch(updateUseBiometric(true));
                } else {
                  dispatch(updateUseBiometric(false));
                }
              })
              .finally(() => {
                dispatch(updateFaceIdEnable(false));
                forceCloseModalV2(false);
                navigation.goBack();
              });
          } else {
            navigation.goBack();
            forceCloseModalV2(false);
          }
        })
        .catch((e: Error) => {
          console.log(e, 'error');
          onUpdateErrors('password')([e.message]);
        })
        .finally(() => {
          setLoading(false);
          // Lock master password incase always require
          if (timeAutoLock === LockTimeout.ALWAYS) {
            keyringLock().catch((e: Error) => console.log(e));
          }
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Deprecated: Migrate master password for biometric user
    if (!isKeychainEnabled && buildNumber <= BEFORE_KEYCHAIN_BUILD_NUMBER && buildNumber > 1) {
      setModalMigrateVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (authMethod === 'master-password') {
      focus('password')();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMethod]);
  useEffect(() => forceCloseModalV2(true), []);
  useEffect(() => {
    if (!isUseBiometric) {
      return;
    }
    if (Platform.OS === 'ios') {
      // Because only iOS-Face ID is require permission, then we need to check permission's availbility
      (async () => {
        try {
          const isBiometricAvailable = await getSupportedBiometryType();
          if (isBiometricAvailable) {
            requestUnlockWithBiometric();
          } else {
            setIsBiometricEnabled(false);
            setAuthMethod('master-password');
          }
        } catch (e) {
          setAuthMethod('master-password');
          console.error(e);
        }
      })();
      return;
    }
    requestUnlockWithBiometric();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function requestUnlockWithBiometric() {
    try {
      const password = await getKeychainPassword();
      if (!password) {
        throw 'Biometry is not available';
      }
      onUnlock(password);
    } catch (e) {
      console.warn(e);
      if (JSON.stringify(e).indexOf('Biometry is not available') !== -1) {
        setIsBiometricEnabled(false);
        setAuthMethod('master-password');
      } else {
        setAuthMethod('master-password');
      }
    }
  }

  const onSubmit = () => {
    const password = formState.data.password;
    onUnlock(password);
  };

  const { formState, onChangeValue, onSubmitField, focus, onUpdateErrors } = useFormControl(formConfig, {
    onSubmitForm: onSubmit,
  });

  const isDisabled = useMemo(() => {
    return loading || !formState.data.password || formState.errors.password.length > 0;
  }, [formState.data.password, formState.errors.password.length, loading]);

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
            })
            .catch((e: Error) => {
              toast.show(e.message, { type: 'danger' });
            })
            .finally(() => {
              _setLoading(false);
              setModalVisible(false);
              if (resetAll) {
                resetPinCode();
              } else {
                dispatch(updateUseBiometric(false));
                resetKeychainPassword();
              }
            });
        }, 300);
      };
    },
    [toast, resetPinCode, dispatch],
  );
  const onToggleModal = () => setModalVisible(state => !state);

  const dismissKeyboard = () => Keyboard.dismiss();

  const neverShowMigrateBiometricModalAgain = () => {
    dispatch(setBuildNumber(1));
    mmkvStore.set('isKeychainEnabled', true);
  };

  return (
    <ImageBackground source={Images.backgroundImg} resizeMode={'cover'} style={imageBackgroundStyle}>
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fullscreen}>
          <SafeAreaView style={styles.container}>
            <Suspense>
              <SVGImages.LogoGradient width={66} height={100} />
              <View style={styles.subLogo}>
                <SVGImages.SubwalletStyled width={139} height={23} />
              </View>
              <Typography.Text size="sm" style={styles.subTitle}>
                Polkadot, Substrate & Ethereum wallet
              </Typography.Text>
              {authMethod === 'master-password' && (
                <>
                  <InlinePassword
                    ref={formState.refs.password}
                    defaultValue={formState.data.password}
                    onChangeText={value => onChangeValue('password')(value)}
                    errorMessages={formState.errors.password}
                    onSubmitField={onSubmitField('password')}
                    containerStyle={{ marginBottom: 0 }}
                  />
                  <View style={styles.fullWidth}>
                    <TouchableOpacity style={styles.forgotpasswordButton} onPress={onToggleModal}>
                      <Typography.Text size="sm" style={styles.forgotpasswordText}>
                        {i18n.common.forgotPassword}
                      </Typography.Text>
                    </TouchableOpacity>
                  </View>
                  <Button loading={loading} disabled={isDisabled} style={styles.submitButton} onPress={onSubmit}>
                    {i18n.buttonTitles.unlock}
                  </Button>
                  {isUseBiometric && isBiometricEnabled && (
                    <Button
                      icon={<SVGImages.Fingerprint />}
                      size="xs"
                      type="ghost"
                      onPress={() => {
                        requestUnlockWithBiometric();
                        setAuthMethod('biometric');
                      }}>
                      {i18n.buttonTitles.unlockWithBiometric}
                    </Button>
                  )}
                </>
              )}
            </Suspense>
            <ForgotPasswordModal
              modalVisible={modalVisible}
              onReset={onReset}
              onCloseModalVisible={onToggleModal}
              resetAccLoading={resetAccLoading}
              eraseAllLoading={eraseAllLoading}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {/* Deprecated: Migrate master password for biometric user */}
      {buildNumber <= BEFORE_KEYCHAIN_BUILD_NUMBER && (
        <MigrateToKeychainPasswordModal
          modalVisible={modalMigrateVisible}
          setModalVisible={setModalMigrateVisible}
          isBiometricV1Enabled={faceIdEnabled && !isUseBiometric}
          onPress={neverShowMigrateBiometricModalAgain}
        />
      )}
    </ImageBackground>
  );
};

export default Login;
