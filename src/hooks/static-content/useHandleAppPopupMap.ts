import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MktCampaignHistoryData } from 'types/staticContent';
import { updatePopupHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AppPopupData } from '@subwallet/extension-base/services/mkt-campaign-service/types';
import { getCountry } from 'react-native-localize';
import { satisfies } from 'compare-versions';
import { getOsVersion } from 'utils/common';
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

  const filteredAppPopupByTimeAndPlatform = useMemo(() => {
    return appPopupData.filter(({ info }) => {
      if (info) {
        if (info.os) {
          return info.platforms.includes('mobile') && info.os.toLowerCase() === Platform.OS;
        } else {
          return info.platforms.includes('mobile');
        }
      }
    });
  }, [appPopupData]);

  const filteredData = useMemo(() => {
    return filteredAppPopupByTimeAndPlatform.filter(
      ({ locations, comparison_operator, os_version_range, app_version_range }) => {
        const validConditionArr = [];
        if (locations && locations.length) {
          const countryId = getCountry();
          const locationIds = locations.map(item => item.split('_')[1]);
          validConditionArr.push(locationIds.includes(countryId));
        }

        if (os_version_range) {
          const osVersion = getOsVersion();
          validConditionArr.push(satisfies(osVersion.toString(), os_version_range));
        }

        if (app_version_range) {
          const appVersion = getVersion();
          validConditionArr.push(satisfies(appVersion, app_version_range));
        }

        if (comparison_operator === 'AND') {
          return validConditionArr.every(c => c);
        } else {
          return validConditionArr.some(c => c);
        }
      },
    );
  }, [filteredAppPopupByTimeAndPlatform]);

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
