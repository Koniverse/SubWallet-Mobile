import { useCallback } from 'react';
import { fetchStaticData } from 'utils/fetchStaticData';
import { useDispatch, useSelector } from 'react-redux';
import { updateExternalApplicationUrlList } from 'stores/Browser';
import { EXTERNAL_APPLICATION_URL_LIST } from 'constants/staticContent';
import { RootState } from 'stores/index';

interface BrowserConfig {
  whiteList: string[];
}

export function useGetBrowserConfig() {
  const { externalApplicationUrlList } = useSelector((state: RootState) => state.browser);
  const dispatch = useDispatch();
  const getBrowserConfig = useCallback(async () => {
    fetchStaticData<BrowserConfig>('browser-config')
      .then(res => {
        dispatch(updateExternalApplicationUrlList(res.whiteList));
      })
      .catch(() => {
        if (!externalApplicationUrlList || !externalApplicationUrlList.length) {
          dispatch(updateExternalApplicationUrlList(EXTERNAL_APPLICATION_URL_LIST));
        }
      });
  }, [dispatch, externalApplicationUrlList]);

  return { getBrowserConfig };
}
