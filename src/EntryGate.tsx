import React, { useEffect } from 'react';
import { AppState, StyleProp, Text, View } from 'react-native';
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
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

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

function getAppWrapperStyle(isVisible: boolean): StyleProp<any> {
  const style: StyleProp<any> = {
    flex: 1,
  };

  if (!isVisible) {
    style.display = 'none';
  }

  return style;
}

function checkRequiredStoresReady(
  accountsStoreStatus: StoreStatus,
  settingsStoreStatus: StoreStatus,
  networkMapStoreStatus: StoreStatus,
  chainRegistryStoreStatus: StoreStatus,
): boolean {
  return ![accountsStoreStatus, settingsStoreStatus, networkMapStoreStatus, chainRegistryStoreStatus].includes('INIT');
}

//todo: make a loading screen here
function Loading() {
  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
      <Text style={{ ...FontMedium, color: ColorMap.light, ...sharedStyles.mediumText }}>Loading...</Text>
    </View>
  );
}

let lastTimestamp = 0;

export const EntryGate = () => {
  SplashScreen.hide();
  const pinCodeEnabled = useSelector((state: RootState) => state.mobileSettings.pinCodeEnabled);
  const autoLockTime = useSelector((state: RootState) => state.mobileSettings.autoLockTime);
  const { isLocked, lock } = useAppLock();

  console.log('isLock----', isLocked);

  const isCryptoReady = useCryptoReady();
  const isI18nReady = useSetupI18n().isI18nReady;

  // Fetching data from web-runner to redux
  const accountsStoreStatus = useStoreAccounts();
  const settingsStoreStatus = useStoreSettings();
  const networkMapStoreStatus = useStoreNetworkMap();
  const chainRegistryStoreStatus = useStoreChainRegistry();
  useStorePrice();
  useStoreBalance();
  useStoreTransactionHistory();

  useEffect(() => {
    //todo: Check lock here and lock the a
    const onAppStateChange = (state: string) => {
      if (!pinCodeEnabled) {
        return;
      }

      if (state === 'background') {
        lastTimestamp = Date.now();
      } else if (state === 'active') {
        if (autoLockTime === undefined) {
          return;
        } else {
          if (Date.now() - lastTimestamp > autoLockTime) {
            lock();
          }
        }
      }
    };

    const listener = AppState.addEventListener('change', onAppStateChange);

    return () => {
      listener.remove();
    };
  }, [autoLockTime, lock, pinCodeEnabled]);

  const isRequiredStoresReady = checkRequiredStoresReady(
    accountsStoreStatus,
    settingsStoreStatus,
    networkMapStoreStatus,
    chainRegistryStoreStatus,
  );

  const isAppReady = isRequiredStoresReady && isCryptoReady && isI18nReady;

  return (
    <View style={viewContainerStyle}>
      <View style={getAppWrapperStyle(isAppReady && !isLocked)}>
        <App isAppReady={isAppReady} />
      </View>

      {!isAppReady && !isLocked && (
        <View style={viewLayerStyle}>
          <Loading />
        </View>
      )}

      {isLocked && (
        <View style={viewLayerStyle}>
          <LockScreen />
        </View>
      )}
    </View>
  );
};

export default EntryGate;
