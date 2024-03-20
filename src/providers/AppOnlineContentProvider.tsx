import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { mmkvStore } from 'utils/storage';
import { deeplinks } from 'utils/browser';
import { Linking } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { getOutputValuesFromString } from 'screens/Transaction/SendFund/Amount';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import BigN from 'bignumber.js';
import { useGroupYieldPosition } from 'hooks/earning';
import {
  AppBannerData,
  AppBasicInfoData,
  AppPopupCondition,
  AppPopupData,
  OnlineContentDataType,
  PopupFrequency,
  PopupHistoryData,
} from 'types/staticContent';

interface AppOnlineContentContextProviderProps {
  children?: React.ReactElement;
}

interface AppOnlineContentContextType {
  appPopupMap: Record<string, AppPopupData[]>;
  appBannerMap: Record<string, AppBannerData[]>;
  popupHistoryMap: Record<string, PopupHistoryData>;
  bannerHistoryMap: Record<string, PopupHistoryData>;
  updatePopupHistoryMap: (id: string) => void;
  updateBannerHistoryMap: (id: string) => void;
  checkPopupVisibleByFrequency: (repeat: PopupFrequency, lastShowTime: number, showTimes: number) => boolean;
  handleButtonPress: (id: string) => (type: OnlineContentDataType, url?: string) => void;
  checkBannerVisible: (showTimes: number) => boolean;
  checkPositionParam: (screen: string, positionParams: { property: string; value: string }[], value: string) => boolean;
}

const TIME_MILLI = {
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
};

export const AppOnlineContentContext = React.createContext({} as AppOnlineContentContextType);

export const AppOnlineContentContextProvider = ({ children }: AppOnlineContentContextProviderProps) => {
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { balanceMap } = useSelector((state: RootState) => state.balance);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const yieldPositionList = useGroupYieldPosition();
  const storedPopupHistoryMap: Record<string, PopupHistoryData> = useMemo(() => {
    try {
      return JSON.parse(mmkvStore.getString('popup-history-map') || '{}');
    } catch (e) {
      return {};
    }
  }, []);
  const storedBannerHistoryMap: Record<string, PopupHistoryData> = useMemo(() => {
    try {
      return JSON.parse(mmkvStore.getString('banner-history-map') || '{}');
    } catch (e) {
      return {};
    }
  }, []);

  const [popupContents, setPopupContents] = useState<AppPopupData[] | undefined>(undefined);
  const [bannerContents, setBannerContents] = useState<AppBannerData[] | undefined>(undefined);
  const [popupHistoryMap, setPopupHistoryMap] = useState<Record<string, PopupHistoryData>>(storedPopupHistoryMap);
  const [bannerHistoryMap, setBannerHistoryMap] = useState<Record<string, PopupHistoryData>>(storedBannerHistoryMap);
  const getAppContentData = useCallback(async (dataType: OnlineContentDataType) => {
    return await axios.get(`https://content.subwallet.app/api/list/app-${dataType}?preview=true`);
  }, []);

  const checkComparison = useCallback((comparison: string, value: string, comparisonValue: string) => {
    switch (comparison) {
      case 'eq':
        return new BigN(value).eq(comparisonValue);
      case 'gt':
        return new BigN(value).gt(comparisonValue);
      case 'gte':
        return new BigN(value).gte(comparisonValue);
      case 'lt':
        return new BigN(value).lt(comparisonValue);
      case 'lte':
        return new BigN(value).lte(comparisonValue);
    }
  }, []);

  //check popup exist time
  const checkPopupExistTime = useCallback((info: AppBasicInfoData) => {
    if (info.start_time && info.stop_time) {
      const now = new Date();
      const startTime = new Date(info.start_time);
      const endTime = new Date(info.stop_time);

      if (now >= startTime && now <= endTime) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }, []);

  //check popup frequency
  const checkPopupVisibleByFrequency = useCallback(
    (repeat: PopupFrequency, lastShowTime: number, showTimes: number) => {
      switch (repeat) {
        case 'once':
          return showTimes < 1;
        case 'daily':
          return Date.now() - lastShowTime > TIME_MILLI.DAY;
        case 'weekly':
          return Date.now() - lastShowTime > TIME_MILLI.WEEK;
        case 'monthly':
          return Date.now() - lastShowTime > TIME_MILLI.MONTH;
        case 'every_time':
          return true;
      }
    },
    [],
  );

  //check banner hidden
  const checkBannerVisible = useCallback((showTimes: number) => {
    return showTimes === 0;
  }, []);

  const checkPositionParam = useCallback(
    (screen: string, positionParams: { property: string; value: string }[], value: string) => {
      if (screen === 'token_detail') {
        const allowTokenSlugs = positionParams.filter(item => item.property === 'tokenSlug').map(param => param.value);
        return allowTokenSlugs.some(slug => value.toLowerCase().includes(slug.toLowerCase()));
      } else if (screen === 'earning') {
        const allowPoolSlugs = positionParams.filter(item => item.property === 'poolSlug').map(param => param.value);
        return allowPoolSlugs.some(slug => value.toLowerCase().includes(slug.toLowerCase()));
      } else {
        return true;
      }
    },
    [],
  );

  const checkBalanceCondition = useCallback(
    (conditionBalance: { comparison: string; value: number; chain_asset: string }[]) => {
      if (currentAccount) {
        const conditionBalanceList = conditionBalance.map(item => {
          const balanceCurrentAccMap = balanceMap[currentAccount.address];
          const balanceData = balanceCurrentAccMap[item.chain_asset];
          const decimals = _getAssetDecimals(assetRegistry[item.chain_asset]);
          const freeBalance = balanceData?.free;
          const comparisonValue = getOutputValuesFromString(item.value.toString(), decimals);
          checkComparison(item.comparison, freeBalance, comparisonValue);
        });

        return conditionBalanceList.some(item => item);
      } else {
        return false;
      }
    },
    [assetRegistry, balanceMap, checkComparison, currentAccount],
  );

  const checkEarningCondition = useCallback(
    (conditionEarning: { comparison: string; value: number; pool_slug: string }[]) => {
      const conditionEarningList = conditionEarning.map(condition => {
        const yieldPosition = yieldPositionList.find(item => item.slug === condition.pool_slug);
        if (yieldPosition) {
          const chainInfo = chainInfoMap[yieldPosition.chain];
          const decimals = chainInfo?.substrateInfo?.decimals || chainInfo?.evmInfo?.decimals;
          const activeStake = yieldPosition.activeStake;
          const comparisonValue = getOutputValuesFromString(condition.value.toString(), decimals || 0);
          checkComparison(condition.comparison, activeStake, comparisonValue);
        } else {
          return false;
        }
      });
      return conditionEarningList.some(item => item);
    },
    [chainInfoMap, checkComparison, yieldPositionList],
  );

  const checkPopupCondition = useCallback(
    (conditions: AppPopupCondition) => {
      let result: boolean[] = [];
      if (Object.keys(conditions) && Object.keys(conditions).length) {
        Object.keys(conditions).forEach(key => {
          switch (key) {
            case 'condition_balance':
              result.push(checkBalanceCondition(conditions.condition_balance));
            case 'condition_earning':
              result.push(checkEarningCondition(conditions.condition_earning));
          }
        });

        return result.some(item => item);
      } else {
        return true;
      }
    },
    [checkBalanceCondition, checkEarningCondition],
  );

  // filter with platform and start_time, stop_time
  const getFilteredDataList = useCallback(
    (data: AppPopupData[] | AppBannerData[], type: OnlineContentDataType) => {
      if (type === 'popup') {
        const filteredData = (data as AppPopupData[])
          .filter(({ info, conditions }) => {
            return info.platforms.includes('mobile') && checkPopupExistTime(info) && checkPopupCondition(conditions);
          })
          .sort((a, b) => a.priority - b.priority);

        setPopupContents(filteredData);
      } else if (type === 'banner') {
        const filteredData = (data as AppBannerData[])
          .filter(({ info, conditions }) => {
            return info.platforms.includes('mobile') && checkPopupExistTime(info) && checkPopupCondition(conditions);
          })
          .sort((a, b) => a.priority - b.priority);
        setBannerContents(filteredData);
      }
    },
    [checkPopupCondition, checkPopupExistTime],
  );

  const initPopupHistoryMap = useCallback((data: AppPopupData[]) => {
    const newData: Record<string, PopupHistoryData> = data.reduce(
      (o, key) =>
        Object.assign(o, {
          [`${key.position}-${key.id}`]: {
            lastShowTime: 0,
            showTimes: 0,
          },
        }),
      {},
    );
    const result = { ...newData, ...storedPopupHistoryMap };
    setPopupHistoryMap(result);
    try {
      mmkvStore.set('popup-history-map', JSON.stringify(result));
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initBannerHistoryMap = useCallback((data: AppBannerData[]) => {
    const newData: Record<string, PopupHistoryData> = data.reduce(
      (o, key) =>
        Object.assign(o, {
          [`${key.position}-${key.id}`]: {
            lastShowTime: 0,
            showTimes: 0,
          },
        }),
      {},
    );
    const result = { ...newData, ...storedBannerHistoryMap };
    setBannerHistoryMap(result);
    try {
      mmkvStore.set('banner-history-map', JSON.stringify(result));
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePopupHistoryMap = useCallback((id: string) => {
    setPopupHistoryMap(prevState => {
      const a = {
        ...prevState,
        [id]: { lastShowTime: Date.now(), showTimes: prevState[id].showTimes + 1 },
      };
      return a;
    });
  }, []);

  const updateBannerHistoryMap = useCallback((id: string) => {
    setBannerHistoryMap(prevState => {
      const a = {
        ...prevState,
        [id]: { lastShowTime: Date.now(), showTimes: prevState[id].showTimes + 1 },
      };
      return a;
    });
  }, []);

  useEffect(() => {
    try {
      mmkvStore.set('popup-history-map', JSON.stringify(popupHistoryMap));
    } catch (e) {
      console.log(e);
    }
  }, [popupHistoryMap]);

  useEffect(() => {
    try {
      mmkvStore.set('banner-history-map', JSON.stringify(bannerHistoryMap));
    } catch (e) {
      console.log(e);
    }
  }, [bannerHistoryMap]);

  useEffect(() => {
    getAppContentData('popup') // change later
      .then(res => {
        getFilteredDataList(res.data, 'popup');
        initPopupHistoryMap(res.data);
      })
      .catch(e => console.error(e));
  }, [getAppContentData, getFilteredDataList, initPopupHistoryMap]);

  useEffect(() => {
    getAppContentData('banner') // change later
      .then(res => {
        getFilteredDataList(res.data, 'banner');
        initBannerHistoryMap(res.data);
      })
      .catch(e => console.error(e));
  }, [getAppContentData, getFilteredDataList, initBannerHistoryMap]);

  const appPopupMap = useMemo(() => {
    if (popupContents) {
      const result: Record<string, AppPopupData[]> = popupContents.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [popupContents]);

  const appBannerMap = useMemo(() => {
    if (bannerContents) {
      const result: Record<string, AppBannerData[]> = bannerContents.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [bannerContents]);

  const handleButtonPress = useCallback(
    (id: string) => {
      return (type: OnlineContentDataType, url?: string) => {
        if (type === 'popup') {
          updatePopupHistoryMap(id);
        }

        if (url) {
          const isDeeplink = deeplinks.some(deeplink => url.startsWith(deeplink));
          if (isDeeplink) {
            Linking.openURL(url);
            return;
          }

          //handle case url is dapp url
          const transformUrl = `subwallet://browser?url=${encodeURIComponent(url)}`;
          Linking.openURL(transformUrl);
        }
      };
    },
    [updatePopupHistoryMap],
  );

  return (
    <AppOnlineContentContext.Provider
      value={{
        appPopupMap,
        popupHistoryMap,
        bannerHistoryMap,
        appBannerMap,
        updatePopupHistoryMap,
        updateBannerHistoryMap,
        checkPopupVisibleByFrequency,
        handleButtonPress,
        checkBannerVisible,
        checkPositionParam,
      }}>
      {children}
    </AppOnlineContentContext.Provider>
  );
};
