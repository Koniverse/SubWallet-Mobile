import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityLoading } from 'components/ActivityLoading';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControlProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import { ScrollViewStyle } from 'styles/sharedStyles';
import { useLazyList } from 'hooks/useLazyList';
import { defaultSortFunc } from 'utils/function';
import { SortFunctionInterface } from 'types/ui-types';

interface Props<T> {
  items: any[];
  searchString: string;
  renderListEmptyComponent: (searchString?: string) => JSX.Element;
  filterFunction?: (items: T[], searchString: string) => T[];
  numberColumns?: number;
  flatListStyle?: StyleProp<any>;
  refreshControl?: React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>>;
  renderItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  sortFunction?: SortFunctionInterface<T>;
  loading?: boolean;
}

const ItemSeparatorStyle: StyleProp<ViewStyle> = {
  height: 16,
};

const IndicatorStyle: StyleProp<any> = {
  width: '100%',
  height: '100%',
};

const ColumnWrapperStyle: StyleProp<ViewStyle> = {
  justifyContent: 'space-between',
};

export function LazyFlatList<T>({
  items,
  renderListEmptyComponent,
  searchString,
  filterFunction,
  numberColumns = 1,
  flatListStyle,
  refreshControl,
  renderItem,
  loading,
  sortFunction = defaultSortFunc,
}: Props<T>) {
  const flatListRef = useRef<FlatList>(null);
  const filteredItems = useMemo(() => {
    return filterFunction ? filterFunction(items, searchString) : items;
  }, [filterFunction, items, searchString]);
  const sortedItems = useMemo(() => filteredItems.sort(sortFunction), [filteredItems, sortFunction]);
  const { isLoading, lazyList, onLoadMore, setPageNumber } = useLazyList(sortedItems);

  useEffect(() => {
    let unmount = false;
    if (flatListRef.current) {
      if (!unmount) {
        setPageNumber(1);
        flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
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

  const renderSeparatorComponent = () => {
    return numberColumns > 1 ? <View style={ItemSeparatorStyle} /> : null;
  };

  if (loading) {
    return <ActivityIndicator style={IndicatorStyle} size={'large'} animating={true} />;
  }
  return (
    <>
      {lazyList.length ? (
        <FlatList
          ref={flatListRef}
          style={{ ...ScrollViewStyle }}
          keyboardShouldPersistTaps={'handled'}
          data={lazyList}
          onEndReached={onLoadMore}
          renderItem={renderItem}
          onEndReachedThreshold={0.3}
          numColumns={numberColumns}
          refreshControl={refreshControl}
          columnWrapperStyle={numberColumns > 1 ? ColumnWrapperStyle : undefined}
          ListFooterComponent={renderLoadingAnimation}
          ItemSeparatorComponent={renderSeparatorComponent}
          contentContainerStyle={numberColumns > 1 ? { paddingHorizontal: 8, paddingBottom: 16 } : flatListStyle}
        />
      ) : (
        renderListEmptyComponent('searchString')
      )}
    </>
  );
}
