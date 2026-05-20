import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Alert, Linking, Platform } from 'react-native';
import { AutoLockState } from 'utils/autoLock';
import i18n from 'utils/i18n/i18n';

// Returns true if iOS Face ID permission is granted (or on Android, where this
// permission concept doesn't apply). Returns false if the user denies, the
// permission is blocked at the OS level, or the device has no biometric sensor.
// When status is DENIED (i.e. not yet determined), this awaits the iOS system
// permission dialog before resolving.
export const requestFaceIDPermission = async (onPressCancel?: () => void): Promise<boolean> => {
  if (Platform.OS === 'android') {
    return true;
  }
  AutoLockState.isPreventAutoLock = true;
  try {
    let status = await check(PERMISSIONS.IOS.FACE_ID);

    if (status === RESULTS.DENIED) {
      // Not yet determined — show the iOS system permission dialog and wait.
      status = await request(PERMISSIONS.IOS.FACE_ID);
    }

    if (status === RESULTS.GRANTED) {
      return true;
    }

    if (status === RESULTS.BLOCKED) {
      Alert.alert(i18n.common.notify, i18n.common.noFaceIdPermission, [
        {
          text: i18n.buttonTitles.cancel,
          onPress: onPressCancel,
        },
        {
          text: i18n.common.goToSetting,
          onPress: () => {
            onPressCancel && onPressCancel();
            Linking.openSettings();
          },
        },
      ]);
      return false;
    }

    // UNAVAILABLE or unexpected status — caller should treat as no permission.
    onPressCancel && onPressCancel();
    return false;
  } catch (e) {
    console.log(e);
    onPressCancel && onPressCancel();
    return false;
  } finally {
    AutoLockState.isPreventAutoLock = false;
  }
};
