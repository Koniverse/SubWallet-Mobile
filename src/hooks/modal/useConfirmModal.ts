import { useCallback, useRef, useState } from 'react';
import { VoidFunction } from 'types/index';

interface Result {
  visible: boolean;
  onPress: () => Promise<boolean>;
  onCompleteModal: VoidFunction;
  onCancelModal: VoidFunction;
  setVisible: (arg: boolean) => void;
}

const useConfirmModal = (onComplete: VoidFunction): Result => {
  const [visible, setVisible] = useState(false);
  const promiseRef = useRef<Promise<boolean> | undefined>();
  const resolveRef = useRef<(value: boolean | PromiseLike<boolean>) => void>();
  const rejectRef = useRef<(reason?: any) => void>();

  const onPress = useCallback(async (): Promise<boolean> => {
    if (promiseRef.current) {
      return promiseRef.current;
    } else {
      setVisible(true);
      promiseRef.current = new Promise<boolean>((resolve, reject) => {
        resolveRef.current = resolve;
        rejectRef.current = reject;
      });

      return promiseRef.current;
    }
  }, []);

  const onCompleteModal = useCallback(() => {
    setVisible(false);
    resolveRef.current?.(true);
    promiseRef.current = undefined;
    setTimeout(() => {
      onComplete();
    }, 300);
  }, [onComplete]);

  const onCancelModal = useCallback(() => {
    console.log('8000');
    rejectRef.current?.(new Error('User cancel request'));
    promiseRef.current = undefined;
  }, []);

  return {
    visible,
    onPress,
    onCompleteModal,
    onCancelModal,
    setVisible,
  };
};

export default useConfirmModal;
