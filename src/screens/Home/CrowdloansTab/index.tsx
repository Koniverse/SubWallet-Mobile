import React, { useState } from 'react';
import { SelectScreen } from 'components/SelectScreen';
import i18n from 'utils/i18n/i18n';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { CrowdloanItem, getGroupKey } from 'screens/Home/CrowdloansTab/CrowdloanItem';
import { CrowdloanItemType } from '../../../types';
import { emptyListContainerStyle, emptyListTextStyle, ScrollViewStyle } from 'styles/sharedStyles';
import { FunnelSimple, Rocket } from 'phosphor-react-native';
import { ActivityLoading } from 'components/ActivityLoading';
import useGetCrowdloanList from 'hooks/screen/Home/CrowdloanTab/useGetCrowdloanList';
import { useLazyList } from 'hooks/useLazyList';
import { CrowdloanFilter } from 'screens/Home/CrowdloansTab/CrowdloanFilter';
import { FilterOptsType } from 'types/ui-types';

const renderItem = ({ item }: ListRenderItemInfo<CrowdloanItemType>) => {
  return <CrowdloanItem item={item} />;
};

const renderListEmptyComponent = () => {
  return (
    <View style={emptyListContainerStyle}>
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

function doFilterOptions(items: CrowdloanItemType[], searchString: string, filterOpts: FilterOptsType) {
  const lowerCaseSearchString = searchString.toLowerCase();
  const result = getListByFilterOpt(items, filterOpts);
  if (searchString) {
    return result.filter(({ networkDisplayName }) => networkDisplayName.toLowerCase().includes(lowerCaseSearchString));
  } else {
    return result;
  }
}

export const CrowdloansTab = () => {
  const items: CrowdloanItemType[] = useGetCrowdloanList();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { isLoading, lazyList, filterOpts, searchString, onSearchOption, onLoadMore, onChangeFilterOptType } =
    useLazyList(items, doFilterOptions);
  const renderLoadingAnimation = () => {
    return isLoading ? <ActivityLoading /> : null;
  };

  return (
    <SelectScreen
      title={i18n.tabName.crowdloans}
      onChangeSearchText={onSearchOption}
      searchString={searchString}
      showLeftBtn={false}
      showRightBtn={true}
      rightIcon={FunnelSimple}
      onPressRightIcon={() => setModalVisible(true)}>
      <>
        {lazyList.length ? (
          <FlatList
            style={{ ...ScrollViewStyle }}
            keyboardShouldPersistTaps={'handled'}
            data={lazyList}
            onEndReached={onLoadMore}
            renderItem={renderItem}
            onEndReachedThreshold={0.7}
            ListFooterComponent={renderLoadingAnimation}
          />
        ) : (
          renderListEmptyComponent()
        )}

        <CrowdloanFilter
          modalVisible={modalVisible}
          onChangeModalVisible={() => setModalVisible(false)}
          filterOpts={filterOpts}
          onChangeFilterOpts={onChangeFilterOptType}
        />
      </>
    </SelectScreen>
  );
};
