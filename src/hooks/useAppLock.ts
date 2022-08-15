import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useCallback, useState } from 'react';
import bcrypt from 'react-native-bcrypt';

export interface UseAppLockOptions {
  isLocked: boolean;
  unlock: (code: string) => boolean;
  lock: () => void;
}

export default function useAppLock(): UseAppLockOptions {
  //todo: useSelector AppState here
  const pinCode = useSelector((state: RootState) => state.mobileSettings.pinCode);

  const [isLocked, setIsLocked] = useState(false);

  const unlock = useCallback(
    (code: string) => {
      const compareRs = bcrypt.compareSync(code, pinCode);
      setIsLocked(!compareRs);
      return compareRs;
    },
    [pinCode],
  );

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  return { isLocked, unlock, lock };
}
