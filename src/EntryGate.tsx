import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, AppState, StyleProp, View } from 'react-native';
import App from './App';
import useAppLock from 'hooks/useAppLock';
import SplashScreen from 'react-native-splash-screen';
import useStoreAccounts from 'hooks/store/useStoreAccounts';
import useStoreSettings from 'hooks/store/useStoreSettings';
import useStoreNetworkMap from 'hooks/store/useStoreNetworkMap';
import useStoreChainRegistry from 'hooks/store/useStoreChainRegistry';
import useStorePrice from 'hooks/store/useStorePrice';
import useStoreBalance from 'hooks/store/useStoreBalance';
import useStoreTransactionHistory from 'hooks/store/useStoreTransactionHistory';
import useCryptoReady from 'hooks/init/useCryptoReady';
import useSetupI18n from 'hooks/init/useSetupI18n';
import { StoreStatus } from 'stores/types';
import { LockScreen } from 'screens/LockScreen';
import { ColorMap } from 'styles/color';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';

const viewContainerStyle: StyleProp<any> = {
  position: 'relative',
  flex: 1,
};

const viewLayerStyle: StyleProp<any> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
  backgroundColor: ColorMap.dark1,
};

function checkRequiredStoresReady(
  accountsStoreStatus: StoreStatus,
  settingsStoreStatus: StoreStatus,
  networkMapStoreStatus: StoreStatus,
): boolean {
  return ![accountsStoreStatus, settingsStoreStatus, networkMapStoreStatus].includes('INIT');
}

//Todo: Decorate more beautiful screen
function Loading() {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

let lastTimestamp = 0;
const autoLockParams: { pinCodeEnabled: boolean; autoLockTime?: number; lock: () => void } = {
  pinCodeEnabled: false,
  autoLockTime: undefined,
  lock: () => {},
};
AppState.addEventListener('change', (state: string) => {
  if (!autoLockParams.pinCodeEnabled) {
    return;
  }

  if (state === 'background') {
    lastTimestamp = Date.now();
  } else if (state === 'active') {
    if (autoLockParams.autoLockTime === undefined) {
      return;
    } else {
      if (Date.now() > lastTimestamp + autoLockParams.autoLockTime) {
        autoLockParams.lock();
      }
    }
  }
});

let firstTimeCheckPincode: boolean | undefined;

export const EntryGate = () => {
  const pinCodeEnabled = useSelector((state: RootState) => state.mobileSettings.pinCodeEnabled);
  const autoLockTime = useSelector((state: RootState) => state.mobileSettings.autoLockTime);
  const { isLocked, lock } = useAppLock();

  const isCryptoReady = useCryptoReady();
  const isI18nReady = useSetupI18n().isI18nReady;

  // Fetching data from web-runner to redux
  const accountsStoreStatus = useStoreAccounts();
  const settingsStoreStatus = useStoreSettings();
  const networkMapStoreStatus = useStoreNetworkMap();
  useStoreChainRegistry();
  useStorePrice();
  useStoreBalance();
  useStoreTransactionHistory();

  // Enable lock screen on the start app
  useEffect(() => {
    if (!firstTimeCheckPincode && pinCodeEnabled) {
      lock();
    }
    firstTimeCheckPincode = true;
  }, [lock, pinCodeEnabled]);

  useEffect(() => {
    autoLockParams.lock = lock;
    autoLockParams.autoLockTime = autoLockTime;
    autoLockParams.pinCodeEnabled = pinCodeEnabled;
  }, [autoLockTime, lock, pinCodeEnabled]);

  const isRequiredStoresReady = checkRequiredStoresReady(
    accountsStoreStatus,
    settingsStoreStatus,
    networkMapStoreStatus,
  );

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 100);
  }, []);

  const isAppReady = isRequiredStoresReady && isCryptoReady && isI18nReady;
  //todo: add more condition for waiting
  const isWaiting = accountsStoreStatus === 'WAITING';

  return useMemo(
    () => (
      <View style={viewContainerStyle}>
        {isAppReady && (
          <View style={{ flex: 1 }}>
            <App />
          </View>
        )}

        <SubWalletFullSizeModal
          modalVisible={isLocked || !isAppReady || isWaiting}
          animationIn={'fadeIn'}
          animationOut={'fadeOut'}>
          {isLocked && (
            <View style={viewLayerStyle}>
              <LockScreen />
            </View>
          )}
          {!isLocked && (!isAppReady || isWaiting) && (
            <View style={viewLayerStyle}>
              <Loading />
            </View>
          )}
        </SubWalletFullSizeModal>
      </View>
    ),
    [isAppReady, isLocked, isWaiting],
  );
};

export default EntryGate;
