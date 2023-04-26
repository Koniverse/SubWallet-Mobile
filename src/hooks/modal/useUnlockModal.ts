import { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { VoidFunction } from 'types/index';

interface Result {
  visible: boolean;
  onPress: () => Promise<boolean>;
  onPasswordComplete: VoidFunction;
  onHideModal: VoidFunction;
}

const useUnlockModal = (onComplete: VoidFunction): Result => {
  const { isLocked, hasMasterPassword } = useSelector((state: RootState) => state.accountState);

  const [visible, setVisible] = useState(false);
  const promiseRef = useRef<Promise<boolean> | undefined>();
  const resolveRef = useRef<(value: boolean | PromiseLike<boolean>) => void>();
  const rejectRef = useRef<(reason?: any) => void>();

  const onPress = useCallback(async (): Promise<boolean> => {
    if (promiseRef.current) {
      return promiseRef.current;
    } else {
      if (hasMasterPassword && isLocked) {
        setVisible(true);
        promiseRef.current = new Promise<boolean>((resolve, reject) => {
          resolveRef.current = resolve;
          rejectRef.current = reject;
        });

        return promiseRef.current;
      } else {
        onComplete();
        return Promise.resolve(true);
      }
    }
  }, [hasMasterPassword, isLocked, onComplete]);

  const onPasswordComplete = useCallback(() => {
    setVisible(false);
    resolveRef.current?.(true);
    promiseRef.current = undefined;
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete]);

  const onHideModal = useCallback(() => {
    setVisible(false);
    rejectRef.current?.(new Error('User cancel request'));
    promiseRef.current = undefined;
  }, []);

  return {
    visible,
    onPress,
    onPasswordComplete,
    onHideModal,
  };
};

export default useUnlockModal;
