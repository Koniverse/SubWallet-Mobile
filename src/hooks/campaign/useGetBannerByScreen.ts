import { useMemo } from 'react';

import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { getBannerSlugs } from 'utils/storage';

const useGetBannerByScreen = (screen: string) => {
  const bannerSlugs = getBannerSlugs();
  const { banners } = useSelector((state: RootState) => state.campaign);

  return useMemo(() => {
    const displayedBanner = banners.filter(
      item => item.data.position.includes(screen) && !bannerSlugs?.includes(item.slug),
    );
    if (!displayedBanner) {
      return [];
    }

    if (screen === 'home') {
      return [displayedBanner[0]];
    } else {
      return displayedBanner;
    }
  }, [bannerSlugs, banners, screen]);
};

export default useGetBannerByScreen;
