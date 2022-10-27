import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Alert, Linking, Platform } from 'react-native';
import i18n from 'utils/i18n/i18n';

export function isTooShortPassword(value: string | null, minLength: number): boolean {
  const valueLength = value ? value.split('').length : 0;
  return valueLength < minLength;
}

const getCameraPermission = () => {
  return Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
};

export const requestCameraPermission = async () => {
  const result = await request(getCameraPermission());

  switch (result) {
    case RESULTS.UNAVAILABLE:
      console.log('Images: This feature is not available (on this device / in this context)');
      break;
    case RESULTS.DENIED:
      console.log('Images: The permission has not been requested / is denied but requestable');
      break;
    case RESULTS.GRANTED:
      console.log('Images: The permission is granted');
      return result;
    case RESULTS.BLOCKED:
      Alert.alert(i18n.common.notify, i18n.common.cannotScanQRCodeWithoutPermission, [
        {
          text: 'Cancel',
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
