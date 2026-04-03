import { useCallback } from 'react';
import { Platform } from 'react-native';
import { getVersion } from 'react-native-device-info';
import axios from 'axios';
import { TOKEN_CONFIG_URL } from 'constants/index';
import { useDispatch, useSelector } from 'react-redux';
import { updateIsShowByToken } from 'stores/base/Settings';
import { RootState } from 'stores/index';

export function useShowBuyToken() {
  const isShowBuyToken = useSelector((state: RootState) => state.settings.isShowBuyToken);
  const dispatch = useDispatch();

  const checkIsShowBuyToken = useCallback(() => {
    if (Platform.OS === 'android') {
      if (!isShowBuyToken) {
        dispatch(updateIsShowByToken(true));
      }

      return;
    }

    const currentAppVersion = getVersion();
    axios
      .get(TOKEN_CONFIG_URL)
      .then(res => {
        const tokenConfig = res.data;
        const shouldShowBuyToken = !!tokenConfig?.buy?.includes(currentAppVersion);
        if (shouldShowBuyToken !== isShowBuyToken) {
          dispatch(updateIsShowByToken(shouldShowBuyToken));
        }
      })
      .catch(() => {
        // Ignore network failures and keep current state.
      });
  }, [dispatch, isShowBuyToken]);

  return { isShowBuyToken, checkIsShowBuyToken };
}
