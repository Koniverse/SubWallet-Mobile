import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import axios from 'axios';
import { updateBrowserDApps } from 'stores/base/Settings';
import { DAppInfo } from 'types/browser';
import { useGetDesktopMode } from 'hooks/screen/Home/Browser/DesktopMode/useGetDesktopMode';

export const baseStaticDataUrl = 'https://static-data.subwallet.app';
export function useGetDAppList() {
  const browserDApps = useSelector((state: RootState) => state.settings.browserDApps);
  const { desktopModeData, defaultDesktopModeData, addToDesktopMode, addToDefaultDesktopMode } = useGetDesktopMode();
  const dispatch = useDispatch();

  const getDAppsData = useCallback(async () => {
    const dApps = await axios.get(`${baseStaticDataUrl}/dapps/preview.json`);
    const dAppCategories = await axios.get(`${baseStaticDataUrl}/categories/list.json`);
    const payload = { dApps: dApps.data, dAppCategories: dAppCategories.data };
    if (!!dApps && dApps.data.length) {
      dispatch(updateBrowserDApps(payload));
    }
    if (dApps.data) {
      // Get not flaged DApps
      const notFlagedDApps = dApps.data.filter((dApp: DAppInfo) => desktopModeData.indexOf(dApp.url || '') === -1);
      const needFlagedDApps = notFlagedDApps.filter((dApp: DAppInfo) => !!dApp.desktop_mode);
      needFlagedDApps.forEach((dApp: DAppInfo) => {
        const storedDefaultUrl = defaultDesktopModeData.find(url => dApp.url === url);
        if (!storedDefaultUrl) {
          addToDesktopMode(dApp.url);
          addToDefaultDesktopMode(dApp.url);
        }
      });
    }
  }, [addToDefaultDesktopMode, addToDesktopMode, defaultDesktopModeData, desktopModeData, dispatch]);

  return { browserDApps, getDAppsData };
}

export async function getTermAndCondition(): Promise<string> {
  return await axios.get(`${baseStaticDataUrl}/term-and-condition/index.md`);
}
