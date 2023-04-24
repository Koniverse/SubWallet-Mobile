import { useCallback } from 'react';
import { RESULTS } from 'react-native-permissions';
import { requestCameraPermission } from 'utils/permission/camera';

type VoidFunction = () => void;

const useCheckCamera = (): ((onClick: VoidFunction) => VoidFunction) => {
  return useCallback((onClick: VoidFunction) => {
    return () => {
      requestCameraPermission().then(result => {
        if (result === RESULTS.GRANTED) {
          onClick();
        }
      });
    };
  }, []);
};

export default useCheckCamera;
