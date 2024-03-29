import { Alert, AppState, AppStateStatus, Linking, Platform } from 'react-native';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { getSystemVersion } from 'react-native-device-info';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import i18n from 'utils/i18n/i18n';

export enum BluetoothPermissionErrors {
  BluetoothAccessBlocked = 'BluetoothAccessBlocked',
  LocationAccessBlocked = 'LocationAccessBlocked',
}

const useBluetoothPermissions = (onPressCancel?: () => void) => {
  const appState = useRef(AppState.currentState);
  const [hasBluetoothPermissions, setHasBluetoothPermissions] = useState<boolean>(false);
  const [bluetoothPermissionError, setBluetoothPermissionError] = useState<BluetoothPermissionErrors>();
  const deviceOSVersion = Number(getSystemVersion()) ?? '';

  const showPermissionAlert = useCallback(() => {
    Alert.alert(i18n.common.notify, 'Please grant Bluetooth access to attach Ledger device', [
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
  }, [onPressCancel]);

  const checkPermissions = async () => {
    setBluetoothPermissionError(undefined);

    if (Platform.OS === 'ios') {
      const bluetoothPermissionStatus = await check(PERMISSIONS.IOS.BLUETOOTH);
      const bluetoothAllowed = bluetoothPermissionStatus === RESULTS.GRANTED;
      switch (bluetoothPermissionStatus) {
        case RESULTS.UNAVAILABLE:
          break;
        case RESULTS.DENIED:
          request(PERMISSIONS.IOS.BLUETOOTH).then(() => onPressCancel && onPressCancel());
          break;
        case RESULTS.GRANTED:
          setHasBluetoothPermissions(true);
          break;
        case RESULTS.BLOCKED:
          showPermissionAlert();
      }
      if (bluetoothAllowed) {
        setHasBluetoothPermissions(true);
      } else {
        setBluetoothPermissionError(BluetoothPermissionErrors.BluetoothAccessBlocked);
      }
    }

    if (Platform.OS === 'android') {
      let bluetoothAllowed: boolean;
      const bluetoothPermissionStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

      if (deviceOSVersion >= 12) {
        const connectPermissionStatus = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
        const scanPermissionStatus = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);

        bluetoothAllowed = connectPermissionStatus === RESULTS.GRANTED && scanPermissionStatus === RESULTS.GRANTED;
      } else {
        bluetoothAllowed = bluetoothPermissionStatus === RESULTS.GRANTED;
      }

      if (bluetoothAllowed) {
        setHasBluetoothPermissions(true);
        // Edge case, when `View setting` click, checkPermissions will trigger, and setBluetoothPermissionError(undefined), but when screen move away to android setting page,
        // bluetoothPermissionError somehow has been set back to `LocationAccessBlocked` error because screen not in metamask. therefore we need to setBluetoothPermissionError(undefined) again below
        // to make sure User come back to Metamask, the bluetoothPermissionError is undefined, otherwise, `ledgerConfirmationModal.tsx` will have issue on retry.
        setBluetoothPermissionError(undefined);
      } else {
        setBluetoothPermissionError(BluetoothPermissionErrors.LocationAccessBlocked);
      }
    }
  };

  useLayoutEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        setBluetoothPermissionError(undefined);
        checkPermissions();
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    checkPermissions();
    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    hasBluetoothPermissions,
    bluetoothPermissionError,
    checkPermissions,
  };
};

export default useBluetoothPermissions;
