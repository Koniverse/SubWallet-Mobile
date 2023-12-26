import { useMemo } from 'react';

import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import { getBannerSlugs } from 'utils/storage';

const bannerSlugs = getBannerSlugs();
const useGetBannerByScreen = (screen: string) => {
  const { banners } = useSelector((state: RootState) => state.campaign);

  return useMemo(() => {
    if (banners.length > 0 && bannerSlugs?.includes(banners[0].slug)) {
      return [];
    }

    return banners.filter(item => item.data.position.includes(screen));
  }, [banners, screen]);
};

export default useGetBannerByScreen;
