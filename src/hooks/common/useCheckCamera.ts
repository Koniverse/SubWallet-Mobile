import { useCallback } from 'react';
import { RESULTS } from 'react-native-permissions';
import { requestCameraPermission } from 'utils/permission/camera';

type VoidFunction = () => void;

const useCheckCamera = (): ((onPressCancel?: VoidFunction, onPressAllow?: VoidFunction) => VoidFunction) => {
  return useCallback((onPressCancel?: VoidFunction, onPressAllow?: VoidFunction) => {
    return () => {
      requestCameraPermission(onPressCancel, onPressAllow).then(result => {
        if (result === RESULTS.GRANTED) {
          onPressAllow && onPressAllow();
        }
      });
    };
  }, []);
};

export default useCheckCamera;
