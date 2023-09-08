import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback } from 'react';
import { updateLockState } from 'stores/AppState';
import { resetBrowserSetting } from 'stores/Browser';
import { updateAutoLockTime, updateUseBiometric } from 'stores/MobileSettings';
import { LockTimeout } from 'stores/types';

export interface UseAppLockOptions {
  isLocked: boolean;
  unlock: () => void;
  unlockApp: () => void;
  lock: () => void;
  resetPinCode: () => void;
}

export default function useAppLock(): UseAppLockOptions {
  const isLocked = useSelector((state: RootState) => state.appState.isLocked);
  const dispatch = useDispatch();

  const unlock = useCallback(() => {
    // const compareRs = bcrypt.compareSync(code, pinCode);
    // dispatch(updateLockState(!compareRs));
    // return compareRs;
  }, []);

  const unlockApp = useCallback(() => {
    dispatch(updateLockState(false));
  }, [dispatch]);

  const lock = useCallback(() => {
    dispatch(updateLockState(true));
  }, [dispatch]);

  const resetPinCode = useCallback(() => {
    dispatch(updateLockState(false));
    dispatch(updateUseBiometric(false));
    dispatch(resetBrowserSetting());
    dispatch(updateAutoLockTime(LockTimeout._15MINUTE));
  }, [dispatch]);

  return { isLocked, unlock, lock, resetPinCode, unlockApp };
}
