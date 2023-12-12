import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import axios from 'axios';
import { updateBrowserDApps } from 'stores/base/Settings';

export const baseStaticDataUrl = 'https://static-data.subwallet.app';
export function useGetDAppList() {
  const browserDApps = useSelector((state: RootState) => state.settings.browserDApps);
  const dispatch = useDispatch();

  const getDAppsData = useCallback(async () => {
    const dApps = await axios.get(`${baseStaticDataUrl}/dapps/list.json`);
    const dAppCategories = await axios.get(`${baseStaticDataUrl}/categories/list.json`);
    const payload = { dApps: dApps.data, dAppCategories: dAppCategories.data };
    if (!!dApps && dApps.data.length && !!dApps && dApps.data.length) {
      dispatch(updateBrowserDApps(payload));
    }
  }, [dispatch]);

  return { browserDApps, getDAppsData };
}

export async function getTermAndCondition(): Promise<string> {
  return await axios.get(`${baseStaticDataUrl}/term-and-condition/index.md`);
}
