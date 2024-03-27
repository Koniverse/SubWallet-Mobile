import React, { useCallback, useContext, useEffect, useMemo } from 'react';
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
  AppConfirmationData,
  AppPopupCondition,
  AppPopupData,
  OnlineContentDataType,
  PopupFrequency,
  PopupHistoryData,
} from 'types/staticContent';
import { GlobalModalContext } from 'providers/GlobalModalContext';
import { RootRouteProps } from 'routes/index';
import {
  updateAppBannerData,
  updateAppConfirmationData,
  updateAppPopupData,
  updateBannerHistoryData,
  updateConfirmationHistoryData,
  updatePopupHistoryData,
} from 'stores/utils';

interface AppOnlineContentContextProviderProps {
  children?: React.ReactElement;
}

interface AppOnlineContentContextType {
  appPopupMap: Record<string, AppPopupData[]>;
  appBannerMap: Record<string, AppBannerData[]>;
  appConfirmationMap: Record<string, AppConfirmationData[]>;
  popupHistoryMap: Record<string, PopupHistoryData>;
  bannerHistoryMap: Record<string, PopupHistoryData>;
  confirmationHistoryMap: Record<string, PopupHistoryData>;
  updatePopupHistoryMap: (id: string) => void;
  updateBannerHistoryMap: (id: string) => void;
  updateConfirmationHistoryMap: (id: string) => void;
  checkPopupExistTime: (info: AppBasicInfoData) => boolean;
  checkPopupVisibleByFrequency: (repeat: PopupFrequency, lastShowTime: number, showTimes: number) => boolean;
  handleButtonPress: (id: string) => (type: OnlineContentDataType, url?: string) => void;
  checkBannerVisible: (showTimes: number) => boolean;
  checkPositionParam: (screen: string, positionParams: { property: string; value: string }[], value: string) => boolean;
  showAppPopup: (currentRoute: RootRouteProps | undefined) => void;
}

const TIME_MILLI = {
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
};

export const AppOnlineContentContext = React.createContext({} as AppOnlineContentContextType);

const getDetailCurrentRoute = (_currentRoute: RootRouteProps | undefined) => {
  if (_currentRoute) {
    switch (_currentRoute.name) {
      case 'Home':
      case 'Drawer':
        // @ts-ignore
        const currentHomeState = _currentRoute.state;
        // @ts-ignore
        const currentHomeRouteMap = currentHomeState?.routes[currentHomeState?.index];
        const currentHomeTabState = currentHomeRouteMap?.state;
        return currentHomeTabState?.routes[currentHomeTabState?.index];
      default:
        return _currentRoute;
    }
  }
};

const getAppTransformRouteName = (currentRoute?: string) => {
  if (!currentRoute) {
    return '';
  }

  switch (currentRoute) {
    case 'Tokens':
      return 'token';
    case 'NFTs':
      return 'nft';
    case 'Earning':
      return 'earning';
    case 'Crowdloans':
      return 'crowdloan';
  }
};

export const AppOnlineContentContextProvider = ({ children }: AppOnlineContentContextProviderProps) => {
  const globalAppModalContext = useContext(GlobalModalContext);
  const { assetRegistry } = useSelector((state: RootState) => state.assetRegistry);
  const { balanceMap } = useSelector((state: RootState) => state.balance);
  const { currentAccount } = useSelector((state: RootState) => state.accountState);
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const yieldPositionList = useGroupYieldPosition();

  const {
    appPopupData,
    appBannerData,
    appConfirmationData,
    popupHistoryMap,
    bannerHistoryMap,
    confirmationHistoryMap,
  } = useSelector((state: RootState) => state.staticContent);

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
    (data: AppPopupData[] | AppBannerData[] | AppConfirmationData[], type: OnlineContentDataType) => {
      if (type === 'popup') {
        // get available popup list
        const activeList = (data as AppPopupData[]).filter(({ info }) => checkPopupExistTime(info));
        const filteredData = activeList
          .filter(({ info, conditions }) => {
            return info.platforms.includes('mobile') && checkPopupCondition(conditions);
          })
          .sort((a, b) => a.priority - b.priority);

        updateAppPopupData(filteredData);
      } else if (type === 'banner') {
        // get available banner list
        const activeList = (data as AppBannerData[]).filter(({ info }) => checkPopupExistTime(info));
        const filteredData = activeList
          .filter(({ info, conditions }) => {
            return info.platforms.includes('mobile') && checkPopupCondition(conditions);
          })
          .sort((a, b) => a.priority - b.priority);
        updateAppBannerData(filteredData);
      } else if (type === 'confirmation') {
        const filteredData = (data as AppConfirmationData[]).filter(({ conditions }) => {
          return checkPopupCondition(conditions);
        });
        updateAppConfirmationData(filteredData);
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
    const result = { ...newData, ...popupHistoryMap };
    updatePopupHistoryData(result);
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
    const result = { ...newData, ...bannerHistoryMap };
    updateBannerHistoryData(result);
    try {
      mmkvStore.set('banner-history-map', JSON.stringify(result));
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initConfirmationHistoryMap = useCallback((data: AppConfirmationData[]) => {
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
    const result = { ...newData, ...confirmationHistoryMap };
    updateConfirmationHistoryData(result);
    try {
      mmkvStore.set('confirmation-history-map', JSON.stringify(result));
    } catch (e) {
      console.log(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePopupHistoryMap = useCallback(
    (id: string) => {
      updatePopupHistoryData({
        ...popupHistoryMap,
        [id]: { lastShowTime: Date.now(), showTimes: popupHistoryMap[id].showTimes + 1 },
      });
    },
    [popupHistoryMap],
  );

  const updateBannerHistoryMap = useCallback(
    (id: string) => {
      updateBannerHistoryData({
        ...bannerHistoryMap,
        [id]: { lastShowTime: Date.now(), showTimes: bannerHistoryMap[id].showTimes + 1 },
      });
    },
    [bannerHistoryMap],
  );

  const updateConfirmationHistoryMap = useCallback(
    (id: string) => {
      updateConfirmationHistoryData({
        ...confirmationHistoryMap,
        [id]: { lastShowTime: Date.now(), showTimes: confirmationHistoryMap[id].showTimes + 1 },
      });
    },
    [confirmationHistoryMap],
  );

  useEffect(() => {
    const popupPromise = getAppContentData('popup');
    const bannerPromise = getAppContentData('banner');
    const confirmationPromise = getAppContentData('confirmation');

    Promise.all([popupPromise, bannerPromise, confirmationPromise])
      .then(values => {
        getFilteredDataList(values[0].data, 'popup');
        initPopupHistoryMap(values[0].data);
        getFilteredDataList(values[1].data, 'banner');
        initBannerHistoryMap(values[1].data);
        getFilteredDataList(values[2].data, 'confirmation');
        initConfirmationHistoryMap(values[2].data);
      })
      .catch(e => {
        console.error(e);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appPopupMap = useMemo(() => {
    if (appPopupData) {
      const result: Record<string, AppPopupData[]> = appPopupData.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [appPopupData]);

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

  const appConfirmationMap = useMemo(() => {
    if (appConfirmationData) {
      const result: Record<string, AppConfirmationData[]> = appConfirmationData.reduce((r, a) => {
        r[a.position] = r[a.position] || [];
        r[a.position].push(a);
        return r;
      }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [appConfirmationData]);

  const handleButtonPress = useCallback(
    (id: string) => {
      return (type: OnlineContentDataType, url?: string) => {
        if (type === 'popup') {
          updatePopupHistoryMap(id);
        } else if (type === 'confirmation') {
          updateConfirmationHistoryMap(id);
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
    [updateConfirmationHistoryMap, updatePopupHistoryMap],
  );

  const showAppPopup = useCallback(
    (currentRoute: RootRouteProps | undefined) => {
      const currentDetailRoute = getDetailCurrentRoute(currentRoute);
      const currentTransformRoute = getAppTransformRouteName(currentDetailRoute?.name) || '';
      const currentPopupList = appPopupMap[currentTransformRoute];
      if (currentPopupList && currentPopupList.length) {
        const filteredPopupList = currentPopupList.filter(item => {
          const popupHistory = popupHistoryMap[`${item.position}-${item.id}`];
          if (popupHistory) {
            return checkPopupVisibleByFrequency(item.repeat, popupHistory.lastShowTime, popupHistory.showTimes);
          } else {
            return false;
          }
        });

        filteredPopupList &&
          filteredPopupList.length &&
          globalAppModalContext.setGlobalModal({
            type: 'popup',
            visible: true,
            title: filteredPopupList[0].info.name,
            message: filteredPopupList[0].content || '',
            buttons: filteredPopupList[0].buttons,
            onPressBtn: url => {
              handleButtonPress(`${filteredPopupList[0].position}-${filteredPopupList[0].id}`)('popup', url);
            },
          });
      }
    },
    [appPopupMap, checkPopupVisibleByFrequency, globalAppModalContext, handleButtonPress, popupHistoryMap],
  );

  return (
    <AppOnlineContentContext.Provider
      value={{
        appPopupMap,
        appBannerMap,
        appConfirmationMap,
        popupHistoryMap,
        bannerHistoryMap,
        confirmationHistoryMap,
        updatePopupHistoryMap,
        updateBannerHistoryMap,
        updateConfirmationHistoryMap,
        checkPopupExistTime,
        checkPopupVisibleByFrequency,
        handleButtonPress,
        checkBannerVisible,
        checkPositionParam,
        showAppPopup,
      }}>
      {children}
    </AppOnlineContentContext.Provider>
  );
};
