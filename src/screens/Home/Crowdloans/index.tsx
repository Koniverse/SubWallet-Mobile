import React, { useCallback, useState } from 'react';
import i18n from 'utils/i18n/i18n';
import { ListRenderItemInfo, Text, View } from 'react-native';
import { CrowdloanItem, getGroupKey } from 'screens/Home/Crowdloans/CrowdloanItem';
import { CrowdloanItemType } from '../../../types';
import { centerStyle, emptyListTextStyle } from 'styles/sharedStyles';
import { FunnelSimple, Rocket } from 'phosphor-react-native';
import useGetCrowdloanList from 'hooks/screen/Home/Crowdloans/useGetCrowdloanList';
import { CrowdloanFilter } from 'screens/Home/Crowdloans/CrowdloanFilter';
import { FilterOptsType } from 'types/ui-types';
import { FlatListScreen } from 'components/FlatListScreen';

const renderItem = ({ item }: ListRenderItemInfo<CrowdloanItemType>) => {
  return <CrowdloanItem item={item} />;
};

const renderListEmptyComponent = () => {
  return (
    <View style={centerStyle}>
      <Rocket size={80} color={'rgba(255, 255, 255, 0.3)'} weight={'thin'} />
      <Text style={emptyListTextStyle}>{i18n.common.emptyCrowdloanListMessage}</Text>
    </View>
  );
};

function getListByFilterOpt(items: CrowdloanItemType[], filterOpts: FilterOptsType) {
  let result: CrowdloanItemType[];
  if (filterOpts.paraChain !== 'all' && filterOpts.crowdloanStatus !== 'all') {
    result = items.filter(
      ({ groupDisplayName, paraState }) =>
        getGroupKey(groupDisplayName) === filterOpts.paraChain && paraState === filterOpts.crowdloanStatus,
    );
  } else if (filterOpts.paraChain === 'all' && filterOpts.crowdloanStatus !== 'all') {
    result = items.filter(({ paraState }) => paraState === filterOpts.crowdloanStatus);
  } else if (filterOpts.paraChain !== 'all' && filterOpts.crowdloanStatus === 'all') {
    result = items.filter(({ groupDisplayName }) => getGroupKey(groupDisplayName) === filterOpts.paraChain);
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

  const doFilterOptions = useCallback(
    (itemList: CrowdloanItemType[], searchString: string) => {
      const lowerCaseSearchString = searchString.toLowerCase();
      const result = getListByFilterOpt(itemList, filterOpts);
      if (searchString) {
        return result.filter(({ networkDisplayName }) =>
          networkDisplayName.toLowerCase().includes(lowerCaseSearchString),
        );
      } else {
        return result;
      }
    },
    [filterOpts],
  );

  return (
    <FlatListScreen<CrowdloanItemType>
      title={i18n.tabName.crowdloans}
      renderListEmptyComponent={renderListEmptyComponent}
      renderItem={renderItem}
      autoFocus={false}
      items={items}
      showLeftBtn={false}
      filterFunction={doFilterOptions}
      rightIconOption={{ icon: FunnelSimple, onPress: () => setModalVisible(true) }}
      afterListItem={
        <CrowdloanFilter
          modalVisible={modalVisible}
          onChangeModalVisible={() => setModalVisible(false)}
          filterOpts={filterOpts}
          onChangeFilterOpts={setFilterOpts}
        />
      }
    />
  );
};
