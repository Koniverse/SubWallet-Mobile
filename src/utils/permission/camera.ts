import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Alert, Linking, Platform } from 'react-native';
import { AutoLockState } from 'utils/autoLock';
import i18n from 'utils/i18n/i18n';
import { mmkvStore } from 'utils/storage';
export const PERMISSION_STATUS = 'permissionStatus';

const getCameraPermission = () => {
  return Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
};

const showPermissionAlert = (onPressCancel?: () => void) => {
  Alert.alert(i18n.common.notify, i18n.common.cannotScanQRCodeWithoutPermission, [
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
};

const recheckCameraPermissionInIos = (onPressCancel?: () => void, onPressAllow?: () => void) => {
  request(getCameraPermission()).then(_result => {
    if (_result === RESULTS.BLOCKED) {
      onPressCancel && onPressCancel();
    } else if (_result === RESULTS.GRANTED) {
      onPressAllow && onPressAllow();
    }
  });
};

export const requestCameraPermission = async (onPressCancel?: () => void, onPressAllow?: () => void) => {
  try {
    AutoLockState.isPreventAutoLock = true;
    const result =
      Platform.OS === 'android' ? await request(getCameraPermission()) : await check(getCameraPermission());
    AutoLockState.isPreventAutoLock = false;

    switch (result) {
      case RESULTS.UNAVAILABLE:
        // Images: This feature is not available (on this device / in this context)
        break;
      case RESULTS.DENIED:
        Platform.OS === 'ios'
          ? recheckCameraPermissionInIos(onPressCancel, onPressAllow)
          : onPressCancel && onPressCancel();
        // Images: The permission has not been requested / is denied but requestable
        break;
      case RESULTS.GRANTED:
        // Images: The permission is granted
        return result;
      case RESULTS.BLOCKED:
        if (Platform.OS === 'ios') {
          showPermissionAlert(onPressCancel);
        } else {
          const permissionStatus = mmkvStore.getString(PERMISSION_STATUS);
          if (!permissionStatus) {
            mmkvStore.set(PERMISSION_STATUS, 'blocked');
            onPressCancel && onPressCancel();
          } else if (permissionStatus === 'blocked') {
            showPermissionAlert(onPressCancel);
          }
        }

        return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};
