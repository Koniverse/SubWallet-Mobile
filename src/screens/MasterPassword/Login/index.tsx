import { Button, Image, Typography } from 'components/design-system-ui';
import useFormControl from 'hooks/screen/useFormControl';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ForgotPasswordModal } from 'components/common/ForgotPasswordModal';
import { useToast } from 'react-native-toast-notifications';
import useHandlerHardwareBackPress from 'hooks/screen/useHandlerHardwareBackPress';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';
import {
  createKeychainPassword,
  getBioDebugLog,
  getKeychainPassword,
  getSupportedBiometryType,
  pushBioDebugLog,
  resetBioDebugLog,
  resetKeychainPassword,
} from 'utils/account';
import { updateFaceIdEnable, updateUseBiometric } from 'stores/MobileSettings';
import { FORCE_HIDDEN_EVENT } from 'components/design-system-ui/modal/ModalBaseV2';
import MigrateToKeychainPasswordModal from '../MigrateToKeychainPasswordModal';
import { backupStorageData, mmkvStore } from 'utils/storage';
import { setBuildNumber } from 'stores/AppVersion';
import { LockTimeout } from 'stores/types';
import useConfirmationsInfo from 'hooks/screen/Confirmation/useConfirmationsInfo';

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

// Module-scoped guard so a Login remount during boot (e.g. accounts redux state
// rehydrating after the screen first appears) cannot fire the biometric prompt
// a second time while the first one is still in flight. Reset once the in-flight
// attempt settles.
let isBiometricUnlockInFlight = false;
// DEBUG-ONLY counters for the in-Alert log dump.
let loginMountSeq = 0;
let loginEffectSeq = 0;
let bioRequestSeq = 0;

function showBioDebugAlert(label: string, onDone?: () => void) {
  if (Platform.OS !== 'ios') {
    onDone?.();
    return;
  }
  const log = getBioDebugLog() || '(empty)';
  resetBioDebugLog();
  Alert.alert(`BIO ${label}`, log, [{ text: 'OK', onPress: () => onDone?.() }]);
}

const Login: React.FC<LoginProps> = ({ navigation }) => {
  const mountSeqRef = React.useRef<number>(0);
  if (mountSeqRef.current === 0) {
    mountSeqRef.current = ++loginMountSeq;
    pushBioDebugLog(`Login MOUNT#${mountSeqRef.current}`);
  }
  const { faceIdEnabled, isUseBiometric, timeAutoLock } = useSelector((state: RootState) => state.mobileSettings);
  const { buildNumber } = useSelector((state: RootState) => state.appVersion);
  const { numberOfConfirmations } = useConfirmationsInfo();
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMigrateVisible, setModalMigrateVisible] = useState<boolean>(false);
  const [resetAccLoading, setAccLoading] = useState(false);
  const [eraseAllLoading, setEraseAllLoading] = useState(false);
  const { isDeepLinkConnect } = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const toast = useToast();
  const [authMethod, setAuthMethod] = useState<AuthMethod>(isUseBiometric ? 'biometric' : 'master-password');
  const styles = createStyles();
  const { unlockApp, resetPinCode } = useAppLock();
  const insets = useSafeAreaInsets();
  const formConfig = {
    password: {
      name: i18n.common.walletPassword,
      value: '',
      require: false,
    },
  };
  useHandlerHardwareBackPress(true);

  const onUnlock = useCallback((password: string, isManualUnlock = false) => {
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
          // Lock master password incase always require
          if (timeAutoLock === LockTimeout.ALWAYS) {
            keyringLock().catch((e: Error) => console.log(e));
          }
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
                forceCloseModalV2(!!(isDeepLinkConnect || !!numberOfConfirmations));
                navigation.goBack();
              });
          } else {
            // Self-heal: a biometric user who had to unlock MANUALLY (e.g. Android after the
            // v5->v6 update when migration could not recover the old keychain entry) gets the
            // keychain re-stored under v6 so biometric unlock works again on the next launch.
            // Only on the manual path — re-storing after a successful biometric unlock would
            // trigger a redundant biometric prompt on every single launch.
            if (isUseBiometric && isManualUnlock) {
              createKeychainPassword(password).catch((err: Error) => console.warn(err));
            }
            navigation.goBack();
            forceCloseModalV2(!!(isDeepLinkConnect || !!numberOfConfirmations));
          }
        })
        .catch((e: Error) => {
          onUpdateErrors('password')([e.message]);
        })
        .finally(() => {
          setLoading(false);
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
      setTimeout(() => {
        focus('password')();
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authMethod]);
  useEffect(() => forceCloseModalV2(true), []);
  useEffect(() => {
    const eSeq = ++loginEffectSeq;
    pushBioDebugLog(`effect#${eSeq} isUseBiometric=${isUseBiometric}`);
    if (!isUseBiometric) {
      return;
    }
    if (Platform.OS === 'ios') {
      // Because only iOS-Face ID is require permission, then we need to check permission's availbility
      (async () => {
        try {
          pushBioDebugLog(`effect#${eSeq} check biometry available`);
          const isBiometricAvailable = await getSupportedBiometryType();
          pushBioDebugLog(`effect#${eSeq} available=${!!isBiometricAvailable?.available}`);
          if (isBiometricAvailable?.available) {
            requestUnlockWithBiometric();
          } else {
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
    const rSeq = ++bioRequestSeq;
    pushBioDebugLog(`req#${rSeq} inFlight=${isBiometricUnlockInFlight}`);
    if (isBiometricUnlockInFlight) {
      pushBioDebugLog(`req#${rSeq} BAILED`);
      return;
    }
    isBiometricUnlockInFlight = true;
    let pwd: string | undefined;
    try {
      pushBioDebugLog(`req#${rSeq} -> getKeychainPassword`);
      pwd = await getKeychainPassword();
      pushBioDebugLog(`req#${rSeq} <- hasPwd=${!!pwd}`);
      if (!pwd) {
        throw 'Biometry is not available';
      }
    } catch (e) {
      pushBioDebugLog(`req#${rSeq} ERROR ${String(e).slice(0, 60)}`);
      console.warn(e);
      setAuthMethod('master-password');
    } finally {
      isBiometricUnlockInFlight = false;
    }
    // Show debug Alert AFTER all FaceID prompts settled, BEFORE onUnlock so
    // the user can screenshot the trace. Tapping OK proceeds with unlock.
    if (pwd) {
      const password = pwd;
      showBioDebugAlert(`req#${rSeq}`, () => setTimeout(() => onUnlock(password), 100));
    } else {
      showBioDebugAlert(`req#${rSeq} (no pwd)`);
    }
  }

  const onSubmit = () => {
    const password = formState.data.password;
    onUnlock(password, true);
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
              // BACKUP-003: Back up local storage after reset account
              backupStorageData(true, false);
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
          <View style={[styles.container, { paddingTop: insets.top + 93, paddingBottom: insets.bottom }]}>
            <Image src={Images.SubWalletLogoGradient} style={{ width: 66, height: 100 }} />
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
                {isUseBiometric && (
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
            <ForgotPasswordModal
              modalVisible={modalVisible}
              onReset={onReset}
              onCloseModalVisible={onToggleModal}
              resetAccLoading={resetAccLoading}
              eraseAllLoading={eraseAllLoading}
            />
          </View>
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
