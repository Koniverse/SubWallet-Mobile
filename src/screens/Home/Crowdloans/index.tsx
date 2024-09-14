import React, { useCallback, useEffect, useMemo } from 'react';
import i18n from 'utils/i18n/i18n';

import { RocketLaunch } from 'phosphor-react-native';
import useGetCrowdloanList from 'hooks/screen/Home/Crowdloans/useGetCrowdloanList';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { _CrowdloanItemType } from 'types/index';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { RefreshControl, View } from 'react-native';
import { CrowdloanItem } from 'screens/Home/Crowdloans/CrowdloanItem';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { useRefresh } from 'hooks/useRefresh';
import { reloadCron } from 'messaging/index';
import { BannerGenerator } from 'components/common/BannerGenerator';
import { RootNavigationProps } from 'routes/index';
import { _FundStatus } from '@subwallet/chain-list/types';
import { ListRenderItemInfo } from '@shopify/flash-list';

enum FilterValue {
  POLKADOT_PARACHAIN = 'Polkadot parachain',
  KUSAMA_PARACHAIN = 'Kusama parachain',
  WON = 'won',
  IN_AUCTION = 'in_auction',
}

function getListByFilterOpt(crowdloanItems: _CrowdloanItemType[], filterOptions: string[]) {
  if (filterOptions.length === 0) {
    return crowdloanItems;
  }
  let result: _CrowdloanItemType[];
  result = crowdloanItems.filter(item => {
    for (const filter of filterOptions) {
      if (filter === FilterValue.POLKADOT_PARACHAIN) {
        if (item.relayChainSlug === 'polkadot') {
          return true;
        }
      } else if (filter === FilterValue.KUSAMA_PARACHAIN) {
        if (item.relayChainSlug === 'kusama') {
          return true;
        }
      } else if (filter === FilterValue.WON) {
        if (item.fundStatus === _FundStatus.WON) {
          return true;
        }
      } else if (filter === FilterValue.IN_AUCTION) {
        if (item.fundStatus === _FundStatus.IN_AUCTION) {
          return true;
        }
      }
    }

    return false;
  });

  return result;
}

export const CrowdloansScreen = () => {
  const theme = useSubWalletTheme().swThemes;
  const navigation = useNavigation<RootNavigationProps>();
  const items: _CrowdloanItemType[] = useGetCrowdloanList();
  const [isRefresh, refresh] = useRefresh();
  const isFocused = useIsFocused();
  const isShowBalance = useSelector((state: RootState) => state.settings.isShowBalance);
  const { currencyData } = useSelector((state: RootState) => state.price);
  const defaultFilterOpts = [
    { label: i18n.filterOptions.polkadotParachain, value: FilterValue.POLKADOT_PARACHAIN },
    { label: i18n.filterOptions.kusamaParachain, value: FilterValue.KUSAMA_PARACHAIN },
    { label: i18n.filterOptions.won, value: FilterValue.WON },
    { label: i18n.filterOptions.inAuction, value: FilterValue.IN_AUCTION },
  ];
  const { banners, onPressBanner, dismissBanner } = useGetBannerByScreen('crowdloan');
  const renderItem = ({ item }: ListRenderItemInfo<_CrowdloanItemType>) => {
    return <CrowdloanItem currencyData={currencyData} item={item} isShowBalance={isShowBalance} />;
  };

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

  const onRefresh = useCallback(() => refresh(reloadCron({ data: 'crowdloan' })), [refresh]);

  const renderListEmptyComponent = () => {
    return (
      <EmptyList
        title={i18n.emptyScreen.crowdloanEmptyTitle}
        icon={RocketLaunch}
        message={i18n.emptyScreen.crowdloanEmptyMessage}
        onPressReload={onRefresh}
        isRefresh={isRefresh}
      />
    );
  };

  return (
    <FlatListScreen
      isShowFilterBtn
      title={i18n.header.crowdloans}
      flatListStyle={{ paddingHorizontal: theme.padding, paddingBottom: 8 }}
      renderListEmptyComponent={renderListEmptyComponent}
      renderItem={renderItem}
      autoFocus={false}
      onPressBack={() => navigation.goBack()}
      items={crowdloanData}
      searchFunction={doFilterOptions}
      filterOptions={defaultFilterOpts}
      filterFunction={getListByFilterOpt}
      placeholder={i18n.placeholder.searchProject}
      refreshControl={<RefreshControl tintColor={theme.colorWhite} refreshing={isRefresh} onRefresh={onRefresh} />}
      estimatedItemSize={76}
      beforeListItem={
        !!(banners && banners.length) ? (
          <View
            style={{ paddingHorizontal: theme.padding, paddingTop: theme.paddingXS, paddingBottom: theme.marginXXS }}>
            <BannerGenerator banners={banners} onPressBanner={onPressBanner} dismissBanner={dismissBanner} />
          </View>
        ) : (
          <></>
        )
      }
    />
  );
};
