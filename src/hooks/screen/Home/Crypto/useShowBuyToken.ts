import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useGetTokenConfigQuery } from 'stores/API';
import { getVersion } from 'react-native-device-info';

export function useShowBuyToken() {
  const { data: tokenConfig } = useGetTokenConfigQuery(undefined, { pollingInterval: 60000 });
  const isShowBuyToken = useMemo(() => {
    if (Platform.OS === 'android') {
      return true;
    }
    const currentAppVersion = getVersion();
    if (tokenConfig?.buy?.includes(currentAppVersion)) {
      return true;
    }
    return false;
  }, [tokenConfig]);

  return isShowBuyToken;
}
