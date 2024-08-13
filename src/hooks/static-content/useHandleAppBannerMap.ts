import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MktCampaignHistoryData } from 'types/staticContent';
import { updateBannerHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AppBannerData } from '@subwallet/extension-base/services/mkt-campaign-service/types';
import { getCountry } from 'react-native-localize';

export const useHandleAppBannerMap = () => {
  const dispatch = useDispatch();
  const { appBannerData, bannerHistoryMap } = useSelector((state: RootState) => state.staticContent);
  const bannerHistoryMapRef = useRef<Record<string, MktCampaignHistoryData>>(bannerHistoryMap);

  useEffect(() => {
    bannerHistoryMapRef.current = bannerHistoryMap;
  }, [bannerHistoryMap]);

  useEffect(() => {
    const newData: Record<string, MktCampaignHistoryData> =
      appBannerData && appBannerData.length
        ? appBannerData.reduce(
            (o, key) =>
              Object.assign(o, {
                [`${key.position}-${key.id}`]: {
                  lastShowTime: 0,
                  showTimes: 0,
                },
              }),
            {},
          )
        : {};
    const result: Record<string, MktCampaignHistoryData> = { ...newData, ...bannerHistoryMapRef.current };
    dispatch(updateBannerHistoryData(result));
  }, [appBannerData, dispatch]);

  const updateBannerHistoryMap = useCallback(
    (ids: string[]) => {
      const result: Record<string, MktCampaignHistoryData> = {};
      for (const key of ids) {
        result[key] = { lastShowTime: Date.now(), showTimes: bannerHistoryMap[key].showTimes + 1 };
      }

      dispatch(
        updateBannerHistoryData({
          ...bannerHistoryMap,
          ...result,
        }),
      );
    },
    [bannerHistoryMap, dispatch],
  );

  const filteredDataByLocation = useMemo(() => {
    return appBannerData.filter(({ locations }) => {
      if (locations && locations.length) {
        const countryId = getCountry();
        const locationIds = locations.map(item => item.split('_')[1]);
        return locationIds.includes(countryId);
      } else {
        return true;
      }
    });
  }, [appBannerData]);

  const appBannerMap = useMemo(() => {
    if (filteredDataByLocation) {
      const result: Record<string, AppBannerData[]> = filteredDataByLocation.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [filteredDataByLocation]);

  return {
    updateBannerHistoryMap,
    appBannerMap,
  };
};
