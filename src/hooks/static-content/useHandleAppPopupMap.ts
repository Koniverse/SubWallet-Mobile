import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MktCampaignHistoryData } from 'types/staticContent';
import { updatePopupHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AppPopupData } from '@subwallet/extension-base/services/mkt-campaign-service/types';
import { getCountry } from 'react-native-localize';

export const useHandleAppPopupMap = () => {
  const { appPopupData, popupHistoryMap } = useSelector((state: RootState) => state.staticContent);
  const popupHistoryMapRef = useRef<Record<string, MktCampaignHistoryData>>(popupHistoryMap);
  const dispatch = useDispatch();

  useEffect(() => {
    popupHistoryMapRef.current = popupHistoryMap;
  }, [popupHistoryMap]);

  useEffect(() => {
    const newData: Record<string, MktCampaignHistoryData> = appPopupData.reduce(
      (o, key) =>
        Object.assign(o, {
          [`${key.position}-${key.id}`]: {
            lastShowTime: 0,
            showTimes: 0,
          },
        }),
      {},
    );
    const result: Record<string, MktCampaignHistoryData> = { ...newData, ...popupHistoryMapRef.current };
    dispatch(updatePopupHistoryData(result));
  }, [appPopupData, dispatch]);

  const updatePopupHistoryMap = useCallback(
    (id: string) => {
      dispatch(
        updatePopupHistoryData({
          ...popupHistoryMap,
          [id]: { lastShowTime: Date.now(), showTimes: popupHistoryMap[id].showTimes + 1 },
        }),
      );
    },
    [dispatch, popupHistoryMap],
  );

  const filteredDataByLocation = useMemo(() => {
    return appPopupData.filter(({ locations }) => {
      console.log('locations', locations);
      if (locations && locations.length) {
        const countryId = getCountry();
        const locationIds = locations.map(item => item.split('_')[1]);
        return locationIds.includes(countryId);
      } else {
        return true;
      }
    });
  }, [appPopupData]);

  const appPopupMap = useMemo(() => {
    if (filteredDataByLocation) {
      const result: Record<string, AppPopupData[]> = filteredDataByLocation.reduce((r, a) => {
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
    updatePopupHistoryMap,
    appPopupMap,
  };
};
