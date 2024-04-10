import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';
import { deeplinks } from 'utils/browser';
import { Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
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
} from 'stores/base/StaticContent';

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
  updateBannerHistoryMap: (ids: string[]) => void;
  updateConfirmationHistoryMap: (id: string) => void;
  checkPopupExistTime: (info: AppBasicInfoData) => boolean;
  checkPopupVisibleByFrequency: (
    repeat: PopupFrequency,
    lastShowTime: number,
    showTimes: number,
    customizeRepeatTime: number | null,
  ) => boolean;
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
  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);
  const yieldPositionList = useGroupYieldPosition();
  const dispatch = useDispatch();

  const {
    appPopupData,
    appBannerData,
    appConfirmationData,
    popupHistoryMap,
    bannerHistoryMap,
    confirmationHistoryMap,
  } = useSelector((state: RootState) => state.staticContent);

  const getAppContentData = useCallback(async (dataType: OnlineContentDataType) => {
    return await axios.get(`https://content.subwallet.app/api/list/app-${dataType}`);
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
    (repeat: PopupFrequency, lastShowTime: number, showTimes: number, customizeRepeatTime: number | null) => {
      if (customizeRepeatTime) {
        return Date.now() - lastShowTime > customizeRepeatTime * 86400000;
      } else {
        if (repeat) {
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
        } else {
          return Date.now() - lastShowTime > TIME_MILLI.DAY;
        }
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
      if (positionParams && positionParams.length) {
        if (screen === 'token_detail') {
          const allowTokenSlugs = positionParams
            .filter(item => item.property === 'tokenSlug')
            .map(param => param.value);
          return allowTokenSlugs.some(slug => value.toLowerCase().includes(slug.toLowerCase()));
        } else if (screen === 'earning') {
          const allowPoolSlugs = positionParams.filter(item => item.property === 'poolSlug').map(param => param.value);
          return allowPoolSlugs.some(slug => value.toLowerCase().includes(slug.toLowerCase()));
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
    [],
  );

  const checkBalanceCondition = useCallback(
    (conditionBalance: { comparison: string; value: number; chain_asset: string }[]) => {
      const conditionBalanceList = conditionBalance.map(item => {
        return Object.values(balanceMap).some(info => {
          const balanceData = info[item.chain_asset];
          const decimals = _getAssetDecimals(assetRegistry[item.chain_asset]);
          const freeBalance = balanceData?.free;
          const lockedBalance = balanceData?.locked;
          const value = new BigN(freeBalance).plus(lockedBalance).toString();
          const comparisonValue = getOutputValuesFromString(item.value.toString(), decimals);
          return checkComparison(item.comparison, value, comparisonValue);
        });
      });

      return conditionBalanceList.some(item => item);
    },
    [assetRegistry, balanceMap, checkComparison],
  );

  const checkEarningCondition = useCallback(
    (conditionEarning: { comparison: string; value: number; pool_slug: string }[]) => {
      const conditionEarningList = conditionEarning.map(condition => {
        const yieldPosition = yieldPositionList.find(item => item.slug === condition.pool_slug);
        if (yieldPosition) {
          const chainInfo = chainInfoMap[yieldPosition.chain];
          const decimals = chainInfo?.substrateInfo?.decimals || chainInfo?.evmInfo?.decimals;
          const activeStake = yieldPosition.totalStake;
          const comparisonValue = getOutputValuesFromString(condition.value.toString(), decimals || 0);
          return checkComparison(condition.comparison, activeStake, comparisonValue);
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
            case 'condition-balance':
              result.push(checkBalanceCondition(conditions['condition-balance']));
              break;
            case 'condition-earning':
              result.push(checkEarningCondition(conditions['condition-earning']));
              break;
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
          .filter(({ info }) => {
            return info.platforms.includes('mobile');
          })
          .sort((a, b) => a.priority - b.priority);

        dispatch(updateAppPopupData(filteredData));
      } else if (type === 'banner') {
        // get available banner list
        const activeList = (data as AppBannerData[]).filter(({ info }) => checkPopupExistTime(info));
        const filteredData = activeList
          .filter(({ info }) => {
            return info.platforms.includes('mobile');
          })
          .sort((a, b) => a.priority - b.priority);
        dispatch(updateAppBannerData(filteredData));
      } else if (type === 'confirmation') {
        const filteredData = data as AppConfirmationData[];
        dispatch(updateAppConfirmationData(filteredData));
      }
    },
    [checkPopupExistTime, dispatch],
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
    dispatch(updatePopupHistoryData(result));
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
    dispatch(updateBannerHistoryData(result));
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
    dispatch(updateConfirmationHistoryData(result));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const updateConfirmationHistoryMap = useCallback(
    (id: string) => {
      dispatch(
        updateConfirmationHistoryData({
          ...confirmationHistoryMap,
          [id]: { lastShowTime: Date.now(), showTimes: confirmationHistoryMap[id].showTimes + 1 },
        }),
      );
    },
    [confirmationHistoryMap, dispatch],
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
      const result: Record<string, AppPopupData[]> = appPopupData
        .filter(item => checkPopupCondition(item.conditions))
        .reduce((r, a) => {
          r[a.position] = r[a.position] || [];
          r[a.position].push(a);
          return r;
        }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [appPopupData, checkPopupCondition]);

  const appBannerMap = useMemo(() => {
    if (appBannerData) {
      const result: Record<string, AppBannerData[]> = appBannerData
        .filter(item => checkPopupCondition(item.conditions))
        .reduce((r, a) => {
          r[a.position] = r[a.position] || [];
          r[a.position].push(a);
          return r;
        }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [appBannerData, checkPopupCondition]);

  const appConfirmationMap = useMemo(() => {
    if (appConfirmationData) {
      const result: Record<string, AppConfirmationData[]> = appConfirmationData
        .filter(item => checkPopupCondition(item.conditions))
        .reduce((r, a) => {
          r[a.position] = r[a.position] || [];
          r[a.position].push(a);
          return r;
        }, Object.create(null));

      return result;
    } else {
      return {};
    }
  }, [appConfirmationData, checkPopupCondition]);

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
            return checkPopupVisibleByFrequency(
              item.repeat,
              popupHistory.lastShowTime,
              popupHistory.showTimes,
              item.repeat_every_x_days,
            );
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
