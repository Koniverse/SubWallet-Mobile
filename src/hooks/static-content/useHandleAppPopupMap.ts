import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MktCampaignHistoryData } from 'types/staticContent';
import { updatePopupHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AppPopupData } from '@subwallet/extension-base/services/mkt-campaign-service/types';
import { getCountry } from 'react-native-localize';
import { satisfies } from 'compare-versions';
import { getIosVersion } from 'utils/common';
import { Platform } from 'react-native';
import { getVersion } from 'react-native-device-info';

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

  const filteredData = useMemo(() => {
    return appPopupData.filter(({ locations, ios_version_range, app_version_range }) => {
      if (locations && locations.length) {
        const countryId = getCountry();
        const locationIds = locations.map(item => item.split('_')[1]);
        return locationIds.includes(countryId);
      }

      if (ios_version_range && Platform.OS === 'ios') {
        const iosVersion = getIosVersion();
        return satisfies(iosVersion, ios_version_range);
      }

      if (app_version_range) {
        const appVersion = getVersion();
        return satisfies(appVersion, app_version_range);
      }

      return true;
    });
  }, [appPopupData]);

  const appPopupMap = useMemo(() => {
    if (filteredData) {
      const result: Record<string, AppPopupData[]> = filteredData.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [filteredData]);

  return {
    updatePopupHistoryMap,
    appPopupMap,
  };
};
