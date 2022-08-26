import React from 'react';
import { SelectScreen } from 'components/SelectScreen';
import i18n from 'utils/i18n/i18n';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { CrowdloanItem } from 'screens/Home/CrowdloansTab/CrowdloanItem';
import { CrowdloanItemType } from '../../../types';
import { emptyListContainerStyle, emptyListTextStyle, ScrollViewStyle } from 'styles/sharedStyles';
import { Rocket } from 'phosphor-react-native';
import { ActivityLoading } from 'components/ActivityLoading';
import useGetCrowdloanList from 'hooks/screen/Home/CrowdloanTab/useGetCrowdloanList';
import { useLazyList } from 'hooks/useLazyList';

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

function doFilterOptions(items: CrowdloanItemType[], searchString: string) {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(
    ({ networkDisplayName, groupDisplayName }) =>
      networkDisplayName.toLowerCase().includes(lowerCaseSearchString) ||
      groupDisplayName.toLowerCase().includes(lowerCaseSearchString),
  );
}

export const CrowdloansTab = () => {
  const items: CrowdloanItemType[] = useGetCrowdloanList();
  const { isLoading, lazyList, searchString, onSearchOption, onLoadMore } = useLazyList(items, doFilterOptions);

  const renderLoadingAnimation = () => {
    return isLoading ? <ActivityLoading /> : null;
  };

  return (
    <SelectScreen
      title={i18n.tabName.crowdloans}
      onChangeSearchText={onSearchOption}
      searchString={searchString}
      showLeftBtn={false}>
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
      </>
    </SelectScreen>
  );
};
