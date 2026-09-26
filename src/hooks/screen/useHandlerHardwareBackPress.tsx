import { BackHandler } from 'react-native';
import { useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';

export default function useHandlerHardwareBackPress(isBusy: boolean) {
  const isFocused = useIsFocused();

  useEffect(() => {
    // Screens stay mounted underneath whatever is pushed on top of them, so a
    // listener left registered here keeps swallowing the hardware back button on
    // every screen above. Only block while this screen is the one on show.
    if (!isFocused) {
      return;
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => isBusy);

    return () => backHandler.remove();
  }, [isBusy, isFocused]);
}
