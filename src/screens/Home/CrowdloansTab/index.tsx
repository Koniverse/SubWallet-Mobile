import React, { useEffect, useState } from 'react';
import { SelectScreen } from 'components/SelectScreen';
import i18n from 'utils/i18n/i18n';
import { FlatList, ListRenderItemInfo, Text, View } from 'react-native';
import { CrowdloanItem } from 'screens/Home/CrowdloansTab/CrowdloanItem';
import { CrowdloanItemType } from '../../../types';
import { emptyListContainerStyle, emptyListTextStyle, ScrollViewStyle } from 'styles/sharedStyles';
import { Rocket } from 'phosphor-react-native';
import { ActivityLoading } from 'components/ActivityLoading';
import useGetCrowdloanList from 'hooks/screen/Home/CrowdloanTab/useGetCrowdloanList';

function sliceArray(array: CrowdloanItemType[], pageNumber: number) {
  return array.slice(0, 15 * pageNumber);
}

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

export const CrowdloansTab = () => {
  const items: CrowdloanItemType[] = useGetCrowdloanList();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [lazyList, setLazyList] = useState<CrowdloanItemType[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [searchString, setSearchString] = useState('');
  const [filteredOptions, setFilteredOption] = useState<CrowdloanItemType[]>(items);
  const dep2 = JSON.stringify(filteredOptions);

  useEffect(() => {
    if (searchString) {
      const lowerCaseSearchString = searchString.toLowerCase();
      setFilteredOption(
        items.filter(
          ({ networkDisplayName, groupDisplayName }) =>
            networkDisplayName.toLowerCase().includes(lowerCaseSearchString) ||
            groupDisplayName.toLowerCase().includes(lowerCaseSearchString),
        ),
      );
    } else {
      setFilteredOption(items);
    }
  }, [items, searchString]);

  useEffect(() => {
    setLazyList(sliceArray(filteredOptions, pageNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep2, pageNumber]);

  const renderLoadingAnimation = () => {
    return isLoading ? <ActivityLoading /> : null;
  };

  const _onLoadMore = () => {
    if (lazyList.length === filteredOptions.length) {
      return;
    }

    setLoading(true);
    const currentPageNumber = pageNumber + 1;
    setTimeout(() => {
      setLoading(false);
      setPageNumber(currentPageNumber);
    }, 300);
  };

  const onSearchCrowdloan = (text: string) => {
    setPageNumber(1);
    setSearchString(text);
  };

  return (
    <SelectScreen
      title={i18n.tabName.crowdloans}
      onChangeSearchText={onSearchCrowdloan}
      searchString={searchString}
      showLeftBtn={false}>
      <>
        {filteredOptions.length ? (
          <FlatList
            style={{ ...ScrollViewStyle }}
            keyboardShouldPersistTaps={'handled'}
            data={lazyList}
            onEndReached={_onLoadMore}
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
