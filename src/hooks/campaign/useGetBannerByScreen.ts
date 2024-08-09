import { useCallback, useContext, useMemo } from 'react';
import { AppOnlineContentContext } from 'providers/AppOnlineContentProvider';

const useGetBannerByScreen = (screen: string, compareValue?: string) => {
  const {
    appBannerMap,
    checkPositionParam,
    checkBannerVisible,
    bannerHistoryMap,
    updateBannerHistoryMap,
    handleButtonPress,
  } = useContext(AppOnlineContentContext);

  const dismissBanner = useCallback(
    (ids: string[]) => {
      updateBannerHistoryMap(ids);
    },
    [updateBannerHistoryMap],
  );

  const onPressBanner = useCallback(
    (id: string) => {
      return (url?: string) => {
        url && handleButtonPress(id)('banner', url);
      };
    },
    [handleButtonPress],
  );

  const banners = useMemo(() => {
    const displayedBanner = appBannerMap[screen];

    if (displayedBanner && displayedBanner.length) {
      return displayedBanner
        .filter(banner => {
          const bannerHistory = bannerHistoryMap[`${banner.position}-${banner.id}`];
          const isBannerVisible = checkBannerVisible(bannerHistory?.showTimes);
          if (compareValue) {
            return checkPositionParam(screen, banner.position_params, [compareValue]) && isBannerVisible;
          } else {
            return isBannerVisible;
          }
        })
        .sort((a, b) => a.priority - b.priority);
    } else {
      return [];
    }
  }, [appBannerMap, screen, bannerHistoryMap, checkBannerVisible, compareValue, checkPositionParam]);

  return { banners, dismissBanner, onPressBanner };
};

export default useGetBannerByScreen;
