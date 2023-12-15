import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityLoading } from 'components/ActivityLoading';
import { ListRenderItemInfo, RefreshControlProps, SectionList, StyleProp, View, ViewStyle } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { useLazyList } from 'hooks/common/useLazyList';
import { SortFunctionInterface } from 'types/ui-types';
import { SectionListData } from 'react-native/Libraries/Lists/SectionList';
import { ActivityIndicator } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export type SectionItem<T> = { title: string; data: T[] };

interface Props<T> {
  items: T[];
  searchString?: string;
  renderListEmptyComponent: (searchString?: string) => JSX.Element;
  renderSectionHeader: (info: { section: SectionListData<T> }) => React.ReactElement | null;
  searchFunction?: (items: T[], searchString: string) => T[];
  filterFunction?: (items: T[], filters: string[]) => T[];
  groupBy: (item: T) => string;
  selectedFilters?: string[];
  listStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>>;
  renderItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  sortItemFunction?: SortFunctionInterface<T>;
  sortSectionFunction?: SortFunctionInterface<SectionItem<T>>;
  loading?: boolean;
  getItemLayout?:
    | ((
        data: SectionListData<T, SectionListData<T>>[] | null,
        index: number,
      ) => { length: number; offset: number; index: number })
    | undefined;
}

export function LazySectionList<T>({
  items,
  renderListEmptyComponent,
  renderSectionHeader,
  searchString = '',
  searchFunction,
  filterFunction,
  selectedFilters,
  listStyle,
  groupBy,
  refreshControl,
  renderItem,
  loading,
  sortItemFunction,
  sortSectionFunction,
  getItemLayout,
}: Props<T>) {
  const theme = useSubWalletTheme().swThemes;
  const sectionListRef = useRef<SectionList>(null);
  const [sections, setSections] = useState<SectionItem<T>[]>([]);

  const sortedItems = useMemo(() => {
    const result = [...items];

    if (sortItemFunction) {
      result.sort(sortItemFunction);
    }

    return result;
  }, [items, sortItemFunction]);

  const filteredItems = useMemo(() => {
    let searchItems = searchFunction ? searchFunction(sortedItems, searchString) : sortedItems;

    return filterFunction && selectedFilters ? filterFunction(searchItems, selectedFilters) : searchItems;
  }, [searchFunction, sortedItems, searchString, filterFunction, selectedFilters]);

  const getSections = useCallback(
    (lazyList: T[]) => {
      const _sections = lazyList.reduce((groups: SectionItem<T>[], item) => {
        const groupTitle = groupBy(item);
        const group = groups.find(g => g.title === groupTitle);
        if (group) {
          group.data.push(item);
        } else {
          groups.push({ title: groupTitle, data: [item] });
        }

        return groups;
      }, []);

      if (sortSectionFunction) {
        _sections.sort(sortSectionFunction);
      }

      setSections(_sections);
    },
    [groupBy, sortSectionFunction],
  );

  const { isLoading, onLoadMore, setPageNumber } = useLazyList(filteredItems, { onAfterSetLazyList: getSections });

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
  }, [setPageNumber]);

  useEffect(() => {
    // Reset page number on change search string => avoid render too many items
    setPageNumber(1);
  }, [searchString, setPageNumber]);

  const renderLoadingAnimation = () => {
    return isLoading ? <ActivityLoading /> : null;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={40} indicatorColor={theme.colorWhite} />
      </View>
    );
  }

  return (
    <>
      {sections.length ? (
        <View style={{ flex: 1 }}>
          <SectionList
            ref={sectionListRef}
            style={{ ...ScrollViewStyle }}
            keyboardShouldPersistTaps={'handled'}
            onEndReached={onLoadMore}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            refreshControl={refreshControl}
            ListFooterComponent={renderLoadingAnimation}
            contentContainerStyle={listStyle}
            sections={sections}
            getItemLayout={getItemLayout}
            onEndReachedThreshold={0.5}
            maxToRenderPerBatch={12}
            initialNumToRender={12}
          />
        </View>
      ) : (
        renderListEmptyComponent('searchString')
      )}
    </>
  );
}
