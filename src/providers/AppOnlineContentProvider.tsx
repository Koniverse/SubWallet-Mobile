import React, { useCallback, useContext } from 'react';
import { deeplinks } from 'utils/browser';
import { Linking } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { AppBasicInfoData, OnlineContentDataType, PopupFrequency, MktCampaignHistoryData } from 'types/staticContent';
import { GlobalModalContext } from 'providers/GlobalModalContext';
import { RootRouteProps } from 'routes/index';
import { useHandleAppPopupMap } from 'hooks/static-content/useHandleAppPopupMap';
import { useHandleAppBannerMap } from 'hooks/static-content/useHandleAppBannerMap';
import { useHandleAppConfirmationMap } from 'hooks/static-content/useHandleAppConfirmationMap';
import {
  AppConfirmationData,
  AppPopupData,
  AppBannerData,
} from '@subwallet/extension-base/services/mkt-campaign-service/types';

interface AppOnlineContentContextProviderProps {
  children?: React.ReactElement;
}

interface AppOnlineContentContextType {
  appPopupMap: Record<string, AppPopupData[]>;
  appBannerMap: Record<string, AppBannerData[]>;
  appConfirmationMap: Record<string, AppConfirmationData[]>;
  popupHistoryMap: Record<string, MktCampaignHistoryData>;
  bannerHistoryMap: Record<string, MktCampaignHistoryData>;
  confirmationHistoryMap: Record<string, MktCampaignHistoryData>;
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
  checkPositionParam: (
    screen: string,
    positionParams: { property: string; value: string }[],
    value: string[],
  ) => boolean;
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
    case 'Browser':
      return 'dapp';
    case 'MissionPools':
      return 'mission_pool';
    case 'History':
      return 'history';
  }
};

export const AppOnlineContentContextProvider = ({ children }: AppOnlineContentContextProviderProps) => {
  const globalAppModalContext = useContext(GlobalModalContext);

  const { popupHistoryMap, bannerHistoryMap, confirmationHistoryMap } = useSelector(
    (state: RootState) => state.staticContent,
  );

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
    (screen: string, positionParams: { property: string; value: string }[], value: string[]) => {
      if (positionParams && positionParams.length) {
        switch (screen) {
          case 'token_detail':
            const allowTokenSlugs = positionParams
              .filter(item => item.property === 'tokenSlug')
              .map(param => param.value);
            return allowTokenSlugs.some(slug => value[0].toLowerCase().includes(slug.toLowerCase()));
          case 'earning':
            const allowPoolSlugs = positionParams
              .filter(item => item.property === 'poolSlug')
              .map(param => param.value);
            return allowPoolSlugs.some(slug => value[0].toLowerCase().includes(slug.toLowerCase()));
          case 'missionPools':
            const selectedIds = positionParams.filter(item => item.property === 'id').map(param => param.value);
            return selectedIds.some(id => value[0].toLowerCase().includes(id.toLowerCase()));
          case 'send-fund':
            const currentChain = value[0];
            const currentDestChain = value[1];
            let isValidChain = true;
            let isValidDestChain = true;
            positionParams.forEach(item => {
              if (item.property === 'chainValue') {
                isValidChain = item.value === currentChain;
              }

              if (item.property === 'destChainValue') {
                isValidDestChain = item.value === currentDestChain;
              }
            });
            return isValidChain && isValidDestChain;
          default:
            return true;
        }
      } else {
        return true;
      }
    },
    [],
  );

  const { updatePopupHistoryMap, appPopupMap } = useHandleAppPopupMap();
  const { appBannerMap, updateBannerHistoryMap } = useHandleAppBannerMap();
  const { appConfirmationMap, updateConfirmationHistoryMap } = useHandleAppConfirmationMap();

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
            title: filteredPopupList[0].info?.name,
            message: filteredPopupList[0].content || '',
            buttons: filteredPopupList[0].buttons,
            onPressBtn: url => {
              handleButtonPress(`${filteredPopupList[0].position}-${filteredPopupList[0].id}`)('popup', url);
            },
            isChangeLogPopup: filteredPopupList[0].info?.is_changelog_popup,
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
