import { useMemo } from 'react';

import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { getBannerSlugs } from 'utils/storage';

const useGetBannerByScreen = (screen: string) => {
  const bannerSlugs = getBannerSlugs();
  const { banners } = useSelector((state: RootState) => state.campaign);

  return useMemo(() => {
    if (banners.length > 0 && bannerSlugs?.includes(banners[0].slug) && screen === 'home') {
      return [];
    }

    return banners.filter(item => item.data.position.includes(screen));
  }, [bannerSlugs, banners, screen]);
};

export default useGetBannerByScreen;
