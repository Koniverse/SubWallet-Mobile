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
  popupHistoryMap: Record<string, PopupHistoryData>;
  appBannerMap: Record<string, AppBannerData>;
  updatePopupHistoryMap: (id: string) => void;
  checkPopupCondition: (conditions: AppPopupCondition) => boolean;
  checkPopupVisibleByFrequency: (repeat: PopupFrequency, lastShowTime: number, showTimes: number) => boolean;
  handleButtonPress: (id: string) => (url?: string) => void;
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

  const [popupContents, setPopupContents] = useState<AppPopupData[] | undefined>(undefined);
  const [popupHistoryMap, setPopupHistoryMap] = useState<Record<string, PopupHistoryData>>(storedPopupHistoryMap);
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
    (data: AppPopupData[]) => {
      const filteredData = data
        .filter(({ info, conditions }) => {
          const result =
            info.platforms.includes('mobile') && checkPopupExistTime(info) && checkPopupCondition(conditions);
          return result;
        })
        .sort((a, b) => a.priority - b.priority);

      setPopupContents(filteredData);
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

  const updatePopupHistoryMap = useCallback((id: string) => {
    setPopupHistoryMap(prevState => {
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
    getAppContentData('popup') // change later
      .then(res => {
        getFilteredDataList(res.data);
        initPopupHistoryMap(res.data);
      })
      .catch(e => console.error(e));
  }, [getAppContentData, getFilteredDataList, initPopupHistoryMap]);

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

  const handleButtonPress = useCallback(
    (id: string) => {
      return (url?: string) => {
        updatePopupHistoryMap(id);
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
        appBannerMap: {},
        updatePopupHistoryMap,
        checkPopupCondition,
        checkPopupVisibleByFrequency,
        handleButtonPress,
      }}>
      {children}
    </AppOnlineContentContext.Provider>
  );
};
