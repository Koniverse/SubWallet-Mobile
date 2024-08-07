import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppBannerData, PopupHistoryData } from 'types/staticContent';
import { updateBannerHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export const useHandleAppBannerMap = () => {
  const dispatch = useDispatch();
  const { appBannerData, bannerHistoryMap } = useSelector((state: RootState) => state.staticContent);
  const bannerHistoryMapRef = useRef<Record<string, PopupHistoryData>>(bannerHistoryMap);

  useEffect(() => {
    bannerHistoryMapRef.current = bannerHistoryMap;
  }, [bannerHistoryMap]);

  useEffect(() => {
    const newData: Record<string, PopupHistoryData> =
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
    const result: Record<string, PopupHistoryData> = {};

    Object.keys(newData).forEach(key => {
      if (!bannerHistoryMapRef.current[key]) {
        result[key] = newData[key];
      } else {
        result[key] = bannerHistoryMapRef.current[key];
      }
    });

    dispatch(updateBannerHistoryData(result));
  }, [appBannerData, dispatch]);

  const updateBannerHistoryMap = useCallback(
    (ids: string[]) => {
      const result: Record<string, PopupHistoryData> = {};
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
