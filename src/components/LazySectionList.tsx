import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityLoading } from 'components/ActivityLoading';
import { RefreshControlProps, View } from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { useLazyList } from 'hooks/common/useLazyList';
import { SortFunctionInterface } from 'types/ui-types';
import { ActivityIndicator } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ContentStyle, FlashList, ListRenderItemInfo } from '@shopify/flash-list';

export type SectionItem<T> = { title: string; data: T[] };

interface Props<T> {
  items: T[];
  searchString?: string;
  renderListEmptyComponent: (searchString?: string) => JSX.Element;
  renderSectionHeader: (item: string, itemLength?: number) => React.ReactElement | null;
  searchFunction?: (items: T[], searchString: string) => T[];
  filterFunction?: (items: T[], filters: string[]) => T[];
  groupBy: (item: T) => string;
  selectedFilters?: string[];
  listStyle?: ContentStyle;
  refreshControl?: React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>>;
  renderItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  sortItemFunction?: SortFunctionInterface<T>;
  sortSectionFunction?: SortFunctionInterface<SectionItem<T>>;
  loading?: boolean;
  estimatedItemSize?: number;
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
  estimatedItemSize,
}: Props<T>) {
  const theme = useSubWalletTheme().swThemes;
  const sectionListRef = useRef<FlashList<string | T>>(null);
  const [sections, setSections] = useState<SectionItem<T>[]>([]);
  const sectionData = useMemo(() => {
    const result: (string | T)[] = [];

    sections.forEach(({ data, title }) => {
      if (data && data.length) {
        result.push(title);
        result.push(...data);
      }
    });

    return result;
  }, [sections]);

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
        sectionListRef.current.scrollToOffset({ animated: false, offset: 0 });
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

  const renderSectionItem = useCallback(
    ({ item, index, extraData, target }: ListRenderItemInfo<string | T>) => {
      if (typeof item === 'string') {
        const itemLength = sections.find(_item => _item.title === item)?.data.length;
        return renderSectionHeader(item, itemLength);
      } else {
        if (renderItem) {
          return renderItem({ item, index, extraData, target });
        } else {
          return <></>;
        }
      }
    },
    [renderItem, renderSectionHeader, sections],
  );

  const getItemType = (item: string | T) => {
    // To achieve better performance, specify the type based on the item
    return typeof item === 'string' ? 'sectionHeader' : 'row';
  };

  const stickyHeaderIndices = sectionData
    .map((item, index) => {
      if (typeof item === 'string') {
        return index;
      } else {
        return null;
      }
    })
    .filter(item => item !== null) as number[];

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
          <FlashList<string | T>
            ref={sectionListRef}
            style={{ ...ScrollViewStyle }}
            keyboardShouldPersistTaps={'handled'}
            onEndReached={onLoadMore}
            renderItem={renderSectionItem}
            refreshControl={refreshControl}
            ListFooterComponent={renderLoadingAnimation}
            contentContainerStyle={listStyle}
            onEndReachedThreshold={0.5}
            stickyHeaderIndices={stickyHeaderIndices}
            getItemType={getItemType}
            estimatedItemSize={estimatedItemSize}
            data={sectionData}
          />
        </View>
      ) : (
        renderListEmptyComponent('searchString')
      )}
    </>
  );
}
