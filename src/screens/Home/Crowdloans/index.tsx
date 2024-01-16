import React, { useCallback, useEffect, useMemo } from 'react';
import i18n from 'utils/i18n/i18n';

import { RocketLaunch } from 'phosphor-react-native';
import useGetCrowdloanList from 'hooks/screen/Home/Crowdloans/useGetCrowdloanList';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { useIsFocused } from '@react-navigation/native';
import { _CrowdloanItemType } from 'types/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { Linking, ListRenderItemInfo, RefreshControl, TouchableOpacity } from 'react-native';
import { CrowdloanItem } from 'screens/Home/Crowdloans/CrowdloanItem';
import FastImage from 'react-native-fast-image';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { CampaignBanner } from '@subwallet/extension-base/background/KoniTypes';
import { useRefresh } from 'hooks/useRefresh';
import { reloadCron } from 'messaging/index';
import { deeplinks } from 'utils/browser';

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      title={i18n.emptyScreen.crowdloanEmptyTitle}
      icon={RocketLaunch}
      message={i18n.emptyScreen.crowdloanEmptyMessage}
    />
  );
};

enum FilterValue {
  POLKADOT_PARACHAIN = 'Polkadot parachain',
  KUSAMA_PARACHAIN = 'Kusama parachain',
  WON = 'won',
  IN_AUCTION = 'in_auction',
}

export const CrowdloansScreen = () => {
  const theme = useSubWalletTheme().swThemes;
  const items: _CrowdloanItemType[] = useGetCrowdloanList();
  const [isRefresh, refresh] = useRefresh();
  const isFocused = useIsFocused();
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const defaultFilterOpts = [
    { label: i18n.filterOptions.polkadotParachain, value: FilterValue.POLKADOT_PARACHAIN },
    { label: i18n.filterOptions.kusamaParachain, value: FilterValue.KUSAMA_PARACHAIN },
    { label: i18n.filterOptions.won, value: FilterValue.WON },
    { label: i18n.filterOptions.inAuction, value: FilterValue.IN_AUCTION },
  ];
  const banners = useGetBannerByScreen('crowdloan');
  const renderItem = ({ item }: ListRenderItemInfo<_CrowdloanItemType>) => {
    return <CrowdloanItem item={item} isShowBalance={isShowBalance} />;
  };

  const openBanner = async (url: string) => {
    const isDeeplink = deeplinks.some(deeplink => url.startsWith(deeplink));
    if (isDeeplink) {
      Linking.openURL(url);
      return;
    }

    const transformUrl = `subwallet://browser?url=${encodeURIComponent(url)}`;
    Linking.openURL(transformUrl);
  };

  const onPressBanner = useCallback((item: CampaignBanner) => {
    return () => {
      if (item.data.action === 'open_url') {
        const url = item.data.metadata?.url as string | undefined;

        if (url) {
          openBanner(url);
        }
      }
    };
  }, []);

  const crowdloanData = useMemo(() => {
    const result = items.sort(
      // @ts-ignore
      (firstItem, secondItem) => secondItem.convertedContribute - firstItem.convertedContribute,
    );

    return result;
  }, [items]);

  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

  const doFilterOptions = useCallback((itemList: _CrowdloanItemType[], searchKeyword: string) => {
    const lowerCaseSearchKeyword = searchKeyword.toLowerCase();
    if (searchKeyword.length > 0) {
      return itemList.filter(({ chainName }) => chainName.toLowerCase().includes(lowerCaseSearchKeyword));
    }
    return itemList;
  }, []);

  function getListByFilterOpt(crowdloanItems: _CrowdloanItemType[], filterOptions: string[]) {
    if (filterOptions.length === 0) {
      return crowdloanItems;
    }
    let result: _CrowdloanItemType[];
    result = crowdloanItems.filter(({ chainName, fundStatus = '' }) => {
      if (filterOptions.includes(chainName) || filterOptions.includes(fundStatus)) {
        return true;
      }
      return false;
    });

    return result;
  }

  return (
    <FlatListScreen
      isShowFilterBtn
      title={i18n.header.crowdloans}
      titleTextAlign={'left'}
      flatListStyle={{ paddingHorizontal: theme.padding, gap: theme.sizeXS, paddingBottom: 8 }}
      renderListEmptyComponent={renderListEmptyComponent}
      renderItem={renderItem}
      autoFocus={false}
      items={crowdloanData}
      showLeftBtn={false}
      searchFunction={doFilterOptions}
      filterOptions={defaultFilterOpts}
      filterFunction={getListByFilterOpt}
      isShowMainHeader
      placeholder={i18n.placeholder.searchProject}
      refreshControl={
        <RefreshControl
          // tintColor={ColorMap.light}
          refreshing={isRefresh}
          onRefresh={() => {
            refresh(reloadCron({ data: 'crowdloan' }));
          }}
        />
      }
      beforeListItem={
        <>
          {banners.map(item => (
            <TouchableOpacity
              onPress={onPressBanner(item)}
              activeOpacity={BUTTON_ACTIVE_OPACITY}
              style={{ marginHorizontal: theme.margin }}>
              <FastImage
                style={{
                  height: 88,
                  borderRadius: theme.borderRadiusLG,
                  marginVertical: theme.marginXS,
                }}
                resizeMode="cover"
                source={{ uri: item.data.media }}
              />
            </TouchableOpacity>
          ))}
        </>
      }
    />
  );
};
