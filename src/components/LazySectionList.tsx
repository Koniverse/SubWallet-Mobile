import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityLoading } from 'components/ActivityLoading';
import { ActivityIndicator, ListRenderItemInfo, RefreshControlProps, SectionList, StyleProp, View } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { useLazyList } from 'hooks/useLazyList';
import { defaultSortFunc } from 'utils/function';
import { SortFunctionInterface } from 'types/ui-types';
import { SectionListData } from 'react-native/Libraries/Lists/SectionList';

interface Props<T> {
  items: T[];
  searchString: string;
  renderListEmptyComponent: (searchString?: string) => JSX.Element;
  renderSectionHeader: (info: { section: SectionListData<T> }) => React.ReactElement | null;
  searchFunction?: (items: T[], searchString: string) => T[];
  filterFunction?: (items: T[], filters: string[]) => T[];
  groupBy: (item: T) => string;
  selectedFilters?: string[];
  listStyle?: StyleProp<any>;
  refreshControl?: React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>>;
  renderItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  sortFunction?: SortFunctionInterface<T>;
  loading?: boolean;
}

const IndicatorStyle: StyleProp<any> = {
  width: '100%',
  height: '100%',
};

export function LazySectionList<T>({
  items,
  renderListEmptyComponent,
  renderSectionHeader,
  searchString,
  searchFunction,
  filterFunction,
  selectedFilters,
  listStyle,
  groupBy,
  refreshControl,
  renderItem,
  loading,
  sortFunction = defaultSortFunc,
}: Props<T>) {
  const sectionListRef = useRef<SectionList>(null);
  const filteredItems = useMemo(() => {
    let searchItem = searchFunction ? searchFunction(items, searchString) : items;

    return filterFunction && selectedFilters ? filterFunction(searchItem, selectedFilters) : searchItem;
  }, [searchFunction, items, searchString, filterFunction, selectedFilters]);

  const sections = useMemo(() => {
    return filteredItems.reduce((groups: { title: string; data: T[] }[], item) => {
      const groupTitle = groupBy(item);
      const group = groups.find(g => g.title === groupTitle);
      if (group) {
        group.data.push(item);
      } else {
        groups.push({ title: groupTitle, data: [item] });
      }

      groups.forEach(g => {
        g.data.sort(sortFunction);
      });

      return groups;
    }, []);
  }, [filteredItems, groupBy, sortFunction]);

  const {
    isLoading,
    lazyList: lazySections,
    onLoadMore,
    setPageNumber,
  } = useLazyList(sections, {
    itemPerPage: 2,
    lazyTime: 300,
  });

  useEffect(() => {
    let unmount = false;
    if (sectionListRef.current) {
      if (!unmount) {
        setPageNumber(1);
        sectionListRef.current.scrollToLocation({ itemIndex: 0, sectionIndex: 0, animated: false });
      }
    }

    return () => {
      unmount = true;
    };
  }, [setPageNumber, sortFunction]);

  useEffect(() => {
    // Reset page number on change search string => avoid render too many items
    setPageNumber(1);
  }, [searchString, setPageNumber]);

  const renderLoadingAnimation = () => {
    return isLoading ? <ActivityLoading /> : null;
  };

  if (loading) {
    return <ActivityIndicator style={IndicatorStyle} size={'large'} animating={true} />;
  }

  return (
    <>
      {lazySections.length ? (
        <View>
          <SectionList
            ref={sectionListRef}
            style={{ ...ScrollViewStyle }}
            keyboardShouldPersistTaps={'handled'}
            onEndReached={onLoadMore}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            onEndReachedThreshold={0.3}
            refreshControl={refreshControl}
            ListFooterComponent={renderLoadingAnimation}
            contentContainerStyle={listStyle}
            sections={lazySections}
          />
        </View>
      ) : (
        renderListEmptyComponent('searchString')
      )}
    </>
  );
}
