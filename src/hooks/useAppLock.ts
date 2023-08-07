import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback } from 'react';
import bcrypt from 'react-native-bcrypt';
import { updateLockState } from 'stores/AppState';
import { updateFaceIdEnable, updatePinCode, updatePinCodeEnable } from 'stores/MobileSettings';

export interface UseAppLockOptions {
  isLocked: boolean;
  unlock: (code: string) => boolean;
  unlockWithBiometric: () => void;
  lock: () => void;
  resetPinCode: () => void;
}

export default function useAppLock(): UseAppLockOptions {
  const isLocked = useSelector((state: RootState) => state.appState.isLocked);
  const { pinCode } = useSelector((state: RootState) => state.mobileSettings);
  const dispatch = useDispatch();

  const unlock = useCallback(
    (code: string) => {
      const compareRs = bcrypt.compareSync(code, pinCode);
      dispatch(updateLockState(!compareRs));
      return compareRs;
    },
    [dispatch, pinCode],
  );

  const unlockWithBiometric = useCallback(() => {
    dispatch(updateLockState(false));
  }, [dispatch]);

  const lock = useCallback(() => {
    dispatch(updateLockState(true));
  }, [dispatch]);

  const resetPinCode = useCallback(() => {
    dispatch(updatePinCode(''));
    dispatch(updateLockState(false));
    dispatch(updatePinCodeEnable(false));
    dispatch(updateFaceIdEnable(false));
  }, [dispatch]);

  return { isLocked, unlock, lock, unlockWithBiometric, resetPinCode };
}
