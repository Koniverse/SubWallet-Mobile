import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { VoidFunction } from 'types/index';
import { noop } from 'utils/function';
import { DeviceEventEmitter, Keyboard } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'routes/index';

export type OnCompleteType = (password?: string) => void;
interface Result {
  onPress: (onComplete: OnCompleteType) => () => Promise<boolean> | undefined;
  onHideModal: () => void;
}

const useUnlockModal = (
  navigation: NativeStackNavigationProp<RootStackParamList>,
  setLoading?: (arg: boolean) => void,
  isUpdateBiometric?: boolean,
  isConfirmation?: boolean,
  onCloseModal?: () => void,
): Result => {
  const { isLocked, hasMasterPassword } = useSelector((state: RootState) => state.accountState);
  const onCompleteRef = useRef<OnCompleteType>(noop);
  const promiseRef = useRef<Promise<boolean> | undefined>();
  const resolveRef = useRef<(value: boolean | PromiseLike<boolean>) => void>();
  const rejectRef = useRef<(reason?: any) => void>();

  useEffect(() => {
    DeviceEventEmitter.addListener('unlockModal', data => {
      if (data.type === 'onComplete') {
        onPasswordComplete(data.password);
      } else {
        !!onCloseModal && onCloseModal();
        onHideModal();
      }
    });

    return () => {
      DeviceEventEmitter.removeAllListeners('unlockModal');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPress = useCallback(
    (onComplete: VoidFunction): (() => Promise<boolean> | undefined) => {
      return () => {
        Keyboard.dismiss();
        if (promiseRef.current) {
          return promiseRef.current;
        } else {
          setTimeout(() => {
            onCompleteRef.current = onComplete;
            if ((hasMasterPassword && isLocked) || isUpdateBiometric) {
              navigation.navigate('UnlockModal', { isUpdateBiometric, isConfirmation });
              promiseRef.current = new Promise<boolean>((resolve, reject) => {
                resolveRef.current = resolve;
                rejectRef.current = reject;
              });

              return promiseRef.current;
            } else {
              onCompleteRef.current();
              return Promise.resolve(true);
            }
          }, 100);
        }
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLocked],
  );

  const onPasswordComplete = useCallback((password: string) => {
    resolveRef.current?.(true);
    promiseRef.current = undefined;
    setTimeout(() => {
      onCompleteRef.current(password);
      onCompleteRef.current = noop;
    }, 300);
  }, []);

  const onHideModal = useCallback(() => {
    setLoading && setLoading(false);
    rejectRef.current?.(new Error('User cancel request'));
    promiseRef.current = undefined;
    onCompleteRef.current = noop;
  }, [setLoading]);

  return {
    onPress,
    onHideModal,
  };
};

export default useUnlockModal;
