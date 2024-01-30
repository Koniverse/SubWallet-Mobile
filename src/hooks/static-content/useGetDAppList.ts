import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import axios from 'axios';
import { updateBrowserDApps } from 'stores/base/Settings';
import { DAppInfo } from 'types/browser';
import { useGetDesktopMode } from 'hooks/screen/Home/Browser/DesktopMode/useGetDesktopMode';
import { getStaticContentByDevMode } from 'utils/storage';
import { STATIC_DATA_DOMAIN } from 'constants/index';

const dataByDevModeStatus = getStaticContentByDevMode();
export function useGetDAppList() {
  const browserDApps = useSelector((state: RootState) => state.settings.browserDApps);
  const {
    desktopModeData,
    defaultDesktopModeData,
    addToDesktopMode,
    addToDefaultDesktopMode,
    removeFromDesktopMode,
    removeFromDefaultDesktopMode,
  } = useGetDesktopMode();
  const dispatch = useDispatch();

  const getDAppsData = useCallback(async () => {
    const dApps = await axios.get(`${STATIC_DATA_DOMAIN}/dapps/${dataByDevModeStatus}.json`);
    const dAppCategories = await axios.get(`${STATIC_DATA_DOMAIN}/categories/${dataByDevModeStatus}.json`);
    const payload = { dApps: dApps.data, dAppCategories: dAppCategories.data };
    if (!!dApps && dApps.data.length) {
      dispatch(updateBrowserDApps(payload));
    }
    if (dApps.data) {
      // Add default desktop mode DApps.
      const notFlagedDApps = dApps.data.filter((dApp: DAppInfo) => desktopModeData.indexOf(dApp.url || '') === -1);
      const needFlagedDApps = notFlagedDApps.filter((dApp: DAppInfo) => !!dApp.desktop_mode);
      needFlagedDApps.forEach((dApp: DAppInfo) => {
        const storedDefaultUrl = defaultDesktopModeData.find(url => dApp.url === url);
        if (!storedDefaultUrl) {
          addToDesktopMode(dApp.url);
          addToDefaultDesktopMode(dApp.url);
        }
      });
      // Remove not default desktop mode DApps.
      const flagedDApps = dApps.data.filter((dApp: DAppInfo) => desktopModeData.indexOf(dApp.url || '') !== -1);
      const needRemoveFlaggedDapps = flagedDApps.filter((dApp: DAppInfo) => !dApp.desktop_mode);
      needRemoveFlaggedDapps.forEach((dApp: DAppInfo) => {
        const storedDefaultUrl = defaultDesktopModeData.find(url => dApp.url === url);
        if (storedDefaultUrl) {
          removeFromDesktopMode(dApp.url);
          removeFromDefaultDesktopMode(dApp.url);
        }
      });
    }
  }, [
    addToDefaultDesktopMode,
    addToDesktopMode,
    defaultDesktopModeData,
    desktopModeData,
    dispatch,
    removeFromDefaultDesktopMode,
    removeFromDesktopMode,
  ]);

  return { browserDApps, getDAppsData };
}

export async function getTermAndCondition(): Promise<string> {
  return await axios.get(`${STATIC_DATA_DOMAIN}/term-and-condition/index.md`);
}
