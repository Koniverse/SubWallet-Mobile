import { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { VoidFunction } from 'types/index';
import { noop } from 'utils/function';

interface Result {
  visible: boolean;
  onPress: (onComplete: VoidFunction) => () => Promise<boolean> | undefined;
  onPasswordComplete: VoidFunction;
  onHideModal: VoidFunction;
}

const useUnlockModal = (): Result => {
  const { isLocked, hasMasterPassword } = useSelector((state: RootState) => state.accountState);

  const [visible, setVisible] = useState(false);
  const onCompleteRef = useRef<VoidFunction>(noop);
  const promiseRef = useRef<Promise<boolean> | undefined>();
  const resolveRef = useRef<(value: boolean | PromiseLike<boolean>) => void>();
  const rejectRef = useRef<(reason?: any) => void>();

  const onPress = useCallback(
    (onComplete: VoidFunction): (() => Promise<boolean> | undefined) => {
      return () => {
        if (promiseRef.current) {
          return promiseRef.current;
        } else {
          onCompleteRef.current = onComplete;

          if (hasMasterPassword && isLocked) {
            setVisible(true);
            promiseRef.current = new Promise<boolean>((resolve, reject) => {
              resolveRef.current = resolve;
              rejectRef.current = reject;
            });

            return promiseRef.current;
          } else {
            onCompleteRef.current();
            return Promise.resolve(true);
          }
        }
      };
    },
    [hasMasterPassword, isLocked],
  );

  const onPasswordComplete = useCallback(() => {
    setVisible(false);
    resolveRef.current?.(true);
    promiseRef.current = undefined;
    setTimeout(() => {
      onCompleteRef.current();
      onCompleteRef.current = noop;
    }, 300);
  }, []);

  const onHideModal = useCallback(() => {
    setVisible(false);
    rejectRef.current?.(new Error('User cancel request'));
    promiseRef.current = undefined;
    onCompleteRef.current = noop;
  }, []);

  return {
    visible,
    onPress,
    onPasswordComplete,
    onHideModal,
  };
};

export default useUnlockModal;
