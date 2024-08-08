import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MktCampaignHistoryData } from 'types/staticContent';
import { updateBannerHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AppBannerData } from '@subwallet/extension-base/services/mkt-campaign-service/types';

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

  const appBannerMap = useMemo(() => {
    if (appBannerData) {
      const result: Record<string, AppBannerData[]> = appBannerData.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [appBannerData]);

  return {
    updateBannerHistoryMap,
    appBannerMap,
  };
};
