import React, { useEffect, useMemo, useRef } from 'react';
import { ActivityLoading } from 'components/ActivityLoading';
import { RefreshControlProps, StyleProp, View, ViewStyle } from 'react-native';
import { useLazyList } from 'hooks/common/useLazyList';
import { defaultSortFunc } from 'utils/function';
import { SortFunctionInterface } from 'types/ui-types';
import { ActivityIndicator } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { ContentStyle, FlashList, ListRenderItemInfo } from '@shopify/flash-list';

interface Props<T> {
  items: T[];
  searchString: string;
  renderListEmptyComponent: (searchString?: string) => JSX.Element;
  searchFunction?: (items: T[], searchString: string) => T[];
  filterFunction?: (items: T[], filters: string[]) => T[];
  selectedFilters?: string[];
  numberColumns?: number;
  flatListStyle?: ContentStyle;
  refreshControl?: React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>>;
  renderItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  sortFunction?: SortFunctionInterface<T>;
  loading?: boolean;
  isShowListWrapper?: boolean;
  getItemLayout?: (
    data: ArrayLike<T> | null | undefined,
    index: number,
  ) => { length: number; offset: number; index: number };
  maxToRenderPerBatch?: number;
  initialNumToRender?: number;
  removeClippedSubviews?: boolean;
  keyExtractor?: (item: T, index: number) => string;
  estimatedItemSize?: number;
}

const ItemSeparatorStyle: StyleProp<ViewStyle> = {
  height: 16,
};

export function LazyFlatList<T>({
  items,
  renderListEmptyComponent,
  searchString,
  searchFunction,
  filterFunction,
  selectedFilters,
  numberColumns = 1,
  flatListStyle,
  refreshControl,
  renderItem,
  loading,
  sortFunction = defaultSortFunc,
  isShowListWrapper,
  removeClippedSubviews,
  keyExtractor,
  estimatedItemSize,
}: Props<T>) {
  const theme = useSubWalletTheme().swThemes;
  const flatListRef = useRef<FlashList<T>>(null);
  const filteredItems = useMemo(() => {
    let searchItem = searchFunction ? searchFunction(items, searchString) : items;

    return filterFunction && selectedFilters ? filterFunction(searchItem, selectedFilters) : searchItem;
  }, [searchFunction, items, searchString, filterFunction, selectedFilters]);
  const sortedItems = useMemo(() => filteredItems.sort(sortFunction), [filteredItems, sortFunction]);
  const { isLoading, lazyList, onLoadMore, setPageNumber } = useLazyList(sortedItems);
  const styleWrapper = [
    isShowListWrapper
      ? {
          backgroundColor: '#1A1A1A',
          marginHorizontal: 16,
          borderRadius: 8,
          // marginBottom: 94,
          paddingVertical: 8,
          flex: 1,
        }
      : {},
    {
      flex: 1,
    },
  ];

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
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size={40} indicatorColor={theme.colorWhite} />
      </View>
    );
  }
  return (
    <>
      {lazyList.length ? (
        <View style={styleWrapper}>
          <FlashList
            ref={flatListRef}
            keyboardShouldPersistTaps={'handled'}
            data={lazyList}
            onEndReached={onLoadMore}
            renderItem={renderItem}
            numColumns={numberColumns}
            refreshControl={refreshControl}
            // columnWrapperStyle={numberColumns > 1 ? ColumnWrapperStyle : undefined}
            ListFooterComponent={renderLoadingAnimation}
            ItemSeparatorComponent={renderSeparatorComponent}
            contentContainerStyle={numberColumns > 1 ? { paddingHorizontal: 8, paddingBottom: 16 } : flatListStyle}
            // getItemLayout={getItemLayout}
            onEndReachedThreshold={0.5}
            // maxToRenderPerBatch={maxToRenderPerBatch}
            // initialNumToRender={initialNumToRender}
            removeClippedSubviews={removeClippedSubviews}
            showsVerticalScrollIndicator={false}
            keyExtractor={keyExtractor}
            onBlankArea={() => {
              return null;
            }}
            disableAutoLayout={true}
            estimatedItemSize={estimatedItemSize}
          />
        </View>
      ) : (
        renderListEmptyComponent(searchString)
      )}
    </>
  );
}
