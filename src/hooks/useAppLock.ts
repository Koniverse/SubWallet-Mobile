import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import bcrypt from 'react-native-bcrypt';

export interface UseAppLockOptions {
  isLock: boolean;
  unlock: (code: string) => boolean;
  lock: () => void;
}

let lastTimestamp = 0;

export default function useAppLock(): UseAppLockOptions {
  const { pinCode, pinCodeEnabled, autoLockTime } = useSelector((state: RootState) => state.mobileSettings);
  const [isLock, setIsLock] = useState(pinCodeEnabled);

  const unlock = (code: string) => {
    return bcrypt.compareSync(code, pinCode);
  };

  const lock = useCallback(() => {
    setIsLock(true);
  }, []);

  useEffect(() => {
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

  return { isLock, unlock, lock };
}
