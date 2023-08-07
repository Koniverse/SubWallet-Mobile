import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Alert, Linking, Platform } from 'react-native';
import { AutoLockState } from 'utils/autoLock';
import i18n from 'utils/i18n/i18n';

const getCameraPermission = () => {
  return Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
};

export const requestCameraPermission = async () => {
  AutoLockState.isPreventAutoLock = true;
  const result = await check(getCameraPermission());
  AutoLockState.isPreventAutoLock = false;

  switch (result) {
    case RESULTS.UNAVAILABLE:
      console.log('Images: This feature is not available (on this device / in this context)');
      break;
    case RESULTS.DENIED:
      request(getCameraPermission());
      console.log('Images: The permission has not been requested / is denied but requestable');
      break;
    case RESULTS.GRANTED:
      console.log('Images: The permission is granted');
      return result;
    case RESULTS.BLOCKED:
      Alert.alert(i18n.common.notify, i18n.common.cannotScanQRCodeWithoutPermission, [
        {
          text: i18n.buttonTitles.cancel,
        },
        {
          text: i18n.common.goToSetting,
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]);
      return;
  }
};
