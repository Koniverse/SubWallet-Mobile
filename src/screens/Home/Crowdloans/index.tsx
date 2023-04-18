import React, { useCallback, useContext, useEffect, useState } from 'react';
import i18n from 'utils/i18n/i18n';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { CrowdloanItem, getGroupKey } from 'screens/Home/Crowdloans/CrowdloanItem';
import { CrowdloanItemType } from '@subwallet/extension-koni-ui/src/types/crowdloan';
import { FunnelSimple, Rocket } from 'phosphor-react-native';
import useGetCrowdloanList from 'hooks/screen/Home/Crowdloans/useGetCrowdloanList';
import { CrowdloanFilter } from 'screens/Home/Crowdloans/CrowdloanFilter';
import { FilterOptsType } from 'types/ui-types';
import { FlatListScreen } from 'components/FlatListScreen';
import { EmptyList } from 'components/EmptyList';
import { ColorMap } from 'styles/color';
import { useRefresh } from 'hooks/useRefresh';
import { restartSubscriptionServices, startSubscriptionServices } from 'messaging/index';
import { WebRunnerContext } from 'providers/contexts';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useIsFocused } from '@react-navigation/native';

const renderItem = ({ item }: ListRenderItemInfo<CrowdloanItemType>) => {
  return <CrowdloanItem item={item} />;
};

const renderListEmptyComponent = () => {
  return <EmptyList title={i18n.common.emptyCrowdloanListMessage} icon={Rocket} />;
};

function getListByFilterOpt(items: CrowdloanItemType[], filterOpts: FilterOptsType) {
  let result: CrowdloanItemType[];
  if (filterOpts.paraChain !== 'all' && filterOpts.crowdloanStatus !== 'all') {
    result = items.filter(
      ({ relayParentDisplayName, paraState }) =>
        getGroupKey(relayParentDisplayName) === filterOpts.paraChain && paraState === filterOpts.crowdloanStatus,
    );
  } else if (filterOpts.paraChain === 'all' && filterOpts.crowdloanStatus !== 'all') {
    result = items.filter(({ paraState }) => paraState === filterOpts.crowdloanStatus);
  } else if (filterOpts.paraChain !== 'all' && filterOpts.crowdloanStatus === 'all') {
    result = items.filter(({ relayParentDisplayName }) => getGroupKey(relayParentDisplayName) === filterOpts.paraChain);
  } else {
    result = items;
  }

  return result;
}

const defaultFilterOpts = {
  paraChain: 'all',
  crowdloanStatus: 'all',
};

export const CrowdloansScreen = () => {
  const items: CrowdloanItemType[] = useGetCrowdloanList();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [filterOpts, setFilterOpts] = useState<FilterOptsType>(defaultFilterOpts);
  const [isRefresh, refresh] = useRefresh();
  const { clearBackgroundServiceTimeout } = useContext(WebRunnerContext);
  const isCrowdloanServiceActive = useSelector(
    (state: RootState) => state.backgroundService.activeState.subscription.crowdloan,
  );
  const isFocused = useIsFocused();

  const doFilterOptions = useCallback(
    (itemList: CrowdloanItemType[], searchString: string) => {
      const lowerCaseSearchString = searchString.toLowerCase();
      const result = getListByFilterOpt(itemList, filterOpts);
      if (searchString) {
        return result.filter(({ chainDisplayName }) => chainDisplayName.toLowerCase().includes(lowerCaseSearchString));
      } else {
        return result;
      }
    },
    [filterOpts],
  );

  useEffect(() => {
    if (isFocused && !isCrowdloanServiceActive) {
      clearBackgroundServiceTimeout('crowdloan');
      startSubscriptionServices(['crowdloan']).catch(e => console.log('Start crowdloan service error:', e));
    }
  }, [clearBackgroundServiceTimeout, isFocused, isCrowdloanServiceActive]);

  return (
    <FlatListScreen
      title={i18n.tabName.crowdloans}
      renderListEmptyComponent={renderListEmptyComponent}
      renderItem={renderItem}
      autoFocus={false}
      items={items}
      showLeftBtn={false}
      searchFunction={doFilterOptions}
      rightIconOption={{ icon: FunnelSimple, onPress: () => setModalVisible(true) }}
      afterListItem={
        <CrowdloanFilter
          modalVisible={modalVisible}
          onChangeModalVisible={() => setModalVisible(false)}
          filterOpts={filterOpts}
          onChangeFilterOpts={setFilterOpts}
        />
      }
      refreshControl={
        <RefreshControl
          style={{ backgroundColor: ColorMap.dark1 }}
          tintColor={ColorMap.light}
          refreshing={isRefresh}
          onRefresh={() => refresh(restartSubscriptionServices(['crowdloan']))}
        />
      }
    />
  );
};
