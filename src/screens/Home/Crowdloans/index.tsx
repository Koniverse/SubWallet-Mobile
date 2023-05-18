import React, { useCallback } from 'react';
import i18n from 'utils/i18n/i18n';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { CrowdloanItem } from 'screens/Home/Crowdloans/CrowdloanItem';
import { CrowdloanItemType } from '@subwallet/extension-koni-ui/src/types/crowdloan';
import { RocketLaunch } from 'phosphor-react-native';
import useGetCrowdloanList from 'hooks/screen/Home/Crowdloans/useGetCrowdloanList';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { ColorMap } from 'styles/color';
import { useRefresh } from 'hooks/useRefresh';
import { restartSubscriptionServices } from 'messaging/index';
import { Header } from 'components/Header';
import { ScreenContainer } from 'components/ScreenContainer';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

const renderItem = ({ item }: ListRenderItemInfo<CrowdloanItemType>) => {
  return <CrowdloanItem item={item} />;
};

const renderListEmptyComponent = () => {
  return <EmptyList title={'No crowdloan'} icon={RocketLaunch} message={'Your crowdloan will appear here!'} />;
};

enum FilterValue {
  POLKADOT_PARACHAIN = 'Polkadot parachain',
  KUSAMA_PARACHAIN = 'Kusama parachain',
  WINNER = 'completed',
  FAIL = 'failed',
}

const defaultFilterOpts = [
  { label: i18n.crowdloanScreen.filter.polkadotChain, value: FilterValue.POLKADOT_PARACHAIN },
  { label: i18n.crowdloanScreen.filter.kusamaChain, value: FilterValue.KUSAMA_PARACHAIN },
  { label: i18n.crowdloanScreen.filter.win, value: FilterValue.WINNER },
  { label: i18n.crowdloanScreen.filter.fail, value: FilterValue.FAIL },
];

export const CrowdloansScreen = () => {
  const theme = useSubWalletTheme().swThemes;
  const items: CrowdloanItemType[] = useGetCrowdloanList();
  const [isRefresh, refresh] = useRefresh();

  const doFilterOptions = useCallback((itemList: CrowdloanItemType[], searchKeyword: string) => {
    const lowerCaseSearchKeyword = searchKeyword.toLowerCase();
    // const result = getListByFilterOpt(itemList, filterOpts);
    if (searchKeyword.length > 0) {
      return itemList.filter(({ chainDisplayName }) => chainDisplayName.toLowerCase().includes(lowerCaseSearchKeyword));
    }
    return itemList;
  }, []);

  function getListByFilterOpt(crowdloanItems: CrowdloanItemType[], filterOptions: string[]) {
    if (filterOptions.length === 0) {
      return crowdloanItems;
    }
    let result: CrowdloanItemType[];
    result = crowdloanItems.filter(({ relayParentDisplayName, paraState = '' }) => {
      if (filterOptions.includes(relayParentDisplayName) || filterOptions.includes(paraState)) {
        return true;
      }
      return false;
    });

    return result;
  }

  return (
    <ScreenContainer backgroundColor={theme.colorBgDefault}>
      <>
        <Header />
        <FlatListScreen
          isShowFilterBtn
          style={{ marginTop: 16 }}
          title={i18n.tabName.crowdloans}
          renderListEmptyComponent={renderListEmptyComponent}
          renderItem={renderItem}
          autoFocus={false}
          items={items}
          showLeftBtn={false}
          searchFunction={doFilterOptions}
          filterOptions={defaultFilterOpts}
          filterFunction={getListByFilterOpt}
          isShowPlaceHolder={false}
          needGapWithStatusBar={false}
          // rightIconOption={{ icon: FunnelSimple, onPress: () => setModalVisible(true) }}
          refreshControl={
            <RefreshControl
              style={{ backgroundColor: ColorMap.dark1 }}
              tintColor={ColorMap.light}
              refreshing={isRefresh}
              onRefresh={() => refresh(restartSubscriptionServices(['crowdloan']))}
            />
          }
        />
      </>
    </ScreenContainer>
  );
};
