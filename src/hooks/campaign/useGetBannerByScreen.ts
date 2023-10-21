import { useMemo } from 'react';

import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';

const useGetBannerByScreen = (screen: string) => {
  const { banners } = useSelector((state: RootState) => state.campaign);

  return useMemo(() => {
    return banners.filter(item => item.data.position.includes(screen));
  }, [banners, screen]);
};

export default useGetBannerByScreen;
