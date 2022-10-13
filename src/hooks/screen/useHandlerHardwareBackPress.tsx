import { BackHandler } from 'react-native';
import { useEffect } from 'react';

export default function useHandlerHardwareBackPress(isBusy: boolean) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => isBusy);
    return () => backHandler.remove();
  }, [isBusy]);
}
