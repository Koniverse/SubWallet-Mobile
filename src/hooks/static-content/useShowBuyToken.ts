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

  const checkIsShowBuyToken = () => {
    if (Platform.OS === 'android') {
      dispatch(updateIsShowByToken(true));
      return;
    }
    const currentAppVersion = getVersion();
    axios.get(TOKEN_CONFIG_URL).then(res => {
      const tokenConfig = res.data;

      if (tokenConfig?.buy?.includes(currentAppVersion)) {
        dispatch(updateIsShowByToken(true));
        return;
      }

      dispatch(updateIsShowByToken(false));
    });
  };

  return { isShowBuyToken, checkIsShowBuyToken };
}
