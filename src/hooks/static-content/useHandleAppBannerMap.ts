import { useCallback, useEffect, useMemo, useRef } from 'react';
import { MktCampaignHistoryData } from 'types/staticContent';
import { updateBannerHistoryData } from 'stores/base/StaticContent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AppBannerData } from '@subwallet/extension-base/services/mkt-campaign-service/types';
import { getCountry } from 'react-native-localize';
import { Platform } from 'react-native';
import { getOsVersion } from 'utils/common';
import { satisfies } from 'compare-versions';
import { getVersion } from 'react-native-device-info';

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

  const filteredAppBannerByTimeAndPlatform = useMemo(() => {
    return appBannerData.filter(({ info }) => {
      if (info) {
        if (info.os) {
          return info.platforms.includes('mobile') && info.os.toLowerCase() === Platform.OS;
        } else {
          return info.platforms.includes('mobile');
        }
      }
    });
  }, [appBannerData]);

  const filteredData = useMemo(() => {
    return filteredAppBannerByTimeAndPlatform.filter(
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
  }, [filteredAppBannerByTimeAndPlatform]);

  const appBannerMap = useMemo(() => {
    if (filteredData) {
      const result: Record<string, AppBannerData[]> = filteredData.reduce((r, a) => {
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
    updateBannerHistoryMap,
    appBannerMap,
  };
};
