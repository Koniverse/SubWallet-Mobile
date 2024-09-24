import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { updateBrowserDApps } from 'stores/base/Settings';
import { DAppCategory, DAppInfo } from 'types/browser';
import { useGetDesktopMode } from 'hooks/screen/Home/Browser/DesktopMode/useGetDesktopMode';
import { fetchStaticData } from 'utils/fetchStaticData';

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
    const dApps = await fetchStaticData<DAppInfo[]>('dapps');
    const dAppCategories = await fetchStaticData<DAppCategory[]>('categories');
    const payload = { dApps: dApps, dAppCategories: dAppCategories };
    if (!!dApps && dApps.length) {
      dispatch(updateBrowserDApps(payload));
    }
    if (dApps) {
      // Add default desktop mode DApps.
      const notFlagedDApps = dApps.filter((dApp: DAppInfo) => desktopModeData.indexOf(dApp.url || '') === -1);
      const needFlagedDApps = notFlagedDApps.filter((dApp: DAppInfo) => !!dApp.desktop_mode);
      const newDefaultDesktopModeDApps: string[] = [];
      needFlagedDApps.forEach((dApp: DAppInfo) => {
        const storedDefaultUrl = defaultDesktopModeData.find(url => dApp.url === url);
        if (!storedDefaultUrl) {
          newDefaultDesktopModeDApps.push(dApp.url);
        }
      });
      if (newDefaultDesktopModeDApps.length > 0) {
        addToDesktopMode(newDefaultDesktopModeDApps);
        addToDefaultDesktopMode(newDefaultDesktopModeDApps);
      }

      // Remove not default desktop mode DApps.
      const flagedDApps = dApps.filter((dApp: DAppInfo) => desktopModeData.indexOf(dApp.url || '') !== -1);
      const needRemoveFlaggedDapps = flagedDApps.filter((dApp: DAppInfo) => !dApp.desktop_mode);
      const newRemoveDefaultDesktopModeDApps: string[] = [];
      needRemoveFlaggedDapps.forEach((dApp: DAppInfo) => {
        const storedDefaultUrl = defaultDesktopModeData.find(url => dApp.url === url);
        if (storedDefaultUrl) {
          newRemoveDefaultDesktopModeDApps.push(dApp.url);
        }
      });

      if (newRemoveDefaultDesktopModeDApps.length > 0) {
        removeFromDesktopMode(newRemoveDefaultDesktopModeDApps);
        removeFromDefaultDesktopMode(newRemoveDefaultDesktopModeDApps);
      }
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
