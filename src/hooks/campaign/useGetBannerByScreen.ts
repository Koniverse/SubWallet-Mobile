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
    (id: string) => {
      updateBannerHistoryMap(id);
    },
    [updateBannerHistoryMap],
  );

  const onPressBanner = useCallback(
    (id: string) => {
      return (url?: string) => {
        handleButtonPress(id)('banner', url);
      };
    },
    [handleButtonPress],
  );

  const banners = useMemo(() => {
    const displayedBanner = appBannerMap[screen];

    if (displayedBanner && displayedBanner.length) {
      return displayedBanner.filter(banner => {
        const bannerHistory = bannerHistoryMap[`${banner.position}-${banner.id}`];
        const isBannerVisible = checkBannerVisible(bannerHistory.showTimes);
        if (compareValue) {
          return checkPositionParam(screen, banner.position_params, compareValue) && isBannerVisible;
        } else {
          return isBannerVisible;
        }
      });
    } else {
      return [];
    }
  }, [appBannerMap, bannerHistoryMap, checkBannerVisible, checkPositionParam, screen, compareValue]);

  return { banners, dismissBanner, onPressBanner };
};

export default useGetBannerByScreen;
