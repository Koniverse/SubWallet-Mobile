import React, { useEffect, useRef, useState } from 'react';
import { IconProps } from 'phosphor-react-native';
import { Keyboard, RefreshControlProps, StyleProp, TextInput, View, ViewStyle } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Search } from 'components/Search';
import { SortFunctionInterface } from 'types/ui-types';
import { defaultSortFunc } from 'utils/function';
import i18n from 'utils/i18n/i18n';
import { LazyFlatList } from 'components/LazyFlatList';
import { NoInternetScreen } from 'components/NoInternetScreen';
import FilterModal, { OptionType } from 'components/common/FilterModal';
import { useFilterModal } from 'hooks/useFilterModal';
import { LazySectionList, SectionItem } from 'components/LazySectionList';
import { ContentStyle, ListRenderItemInfo } from '@shopify/flash-list';

export interface RightIconOpt {
  icon?: (iconProps: IconProps) => JSX.Element;
  title?: string;
  disabled?: boolean;
  onPress: () => void;
  color?: string;
}

interface Props<T> {
  items: any[];
  title?: string;
  withSearchInput?: boolean;
  withSubHeader?: boolean;
  autoFocus?: boolean;
  renderListEmptyComponent: (searchString?: string) => JSX.Element;
  renderItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  onPressBack?: () => void;
  showLeftBtn?: boolean;
  style?: StyleProp<ViewStyle>;
  rightIconOption?: RightIconOpt;
  beforeListItem?: JSX.Element;
  afterListItem?: JSX.Element;
  searchFunction?: (items: T[], searchString: string) => T[];
  filterFunction?: (items: T[], filters: string[]) => T[];
  sortFunction?: SortFunctionInterface<T>;
  searchMarginBottom?: number;
  placeholder?: string;
  numberColumns?: number;
  loading?: boolean;
  flatListStyle?: ContentStyle;
  leftButtonDisabled?: boolean;
  headerContent?: () => JSX.Element;
  refreshControl?: React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>>;
  isLoadingData?: boolean;
  isNetConnected?: boolean;
  isShowFilterBtn?: boolean;
  filterOptions?: OptionType[];
  isShowListWrapper?: boolean;
  grouping?: {
    renderSectionHeader: (item: string, itemLength?: number) => React.ReactElement | null;
    groupBy: (item: T) => string;
    sortSection?: SortFunctionInterface<SectionItem<T>>;
  };
  isShowMainHeader?: boolean;
  isShowBottomSafeArea?: boolean;
  defaultSearchString?: string;
  defaultSelectionMap?: Record<string, boolean>;
  androidKeyboardVerticalOffset?: number;
  titleTextAlign?: 'left' | 'center';
  estimatedItemSize?: number;
  extraData?: any;
  keyExtractor?: (item: T, index: number) => string;
  removeClippedSubviews?: boolean;
  isShowCustomContent?: boolean;
  renderCustomContent?: () => JSX.Element | JSX.Element[];
}

export function FlatListScreen<T>({
  items,
  title,
  autoFocus = true,
  onPressBack,
  withSearchInput = true,
  showLeftBtn = true,
  withSubHeader = true,
  loading,
  style,
  rightIconOption,
  renderItem,
  afterListItem,
  renderListEmptyComponent,
  searchFunction,
  filterFunction,
  placeholder = i18n.common.search,
  numberColumns = 1,
  searchMarginBottom = 16,
  sortFunction = defaultSortFunc,
  flatListStyle,
  leftButtonDisabled,
  headerContent,
  refreshControl,
  isLoadingData = false,
  isNetConnected = true,
  isShowFilterBtn,
  filterOptions,
  isShowListWrapper = false,
  beforeListItem,
  grouping,
  isShowMainHeader,
  isShowBottomSafeArea,
  defaultSearchString,
  defaultSelectionMap,
  androidKeyboardVerticalOffset,
  titleTextAlign,
  estimatedItemSize,
  extraData,
  keyExtractor,
  removeClippedSubviews,
  isShowCustomContent,
  renderCustomContent,
}: Props<T>) {
  const [searchString, setSearchString] = useState<string>(defaultSearchString || '');
  const searchRef = useRef<TextInput>(null);
  const { filterSelectionMap, openFilterModal, onApplyFilter, onChangeFilterOption, selectedFilters, filterModalRef } =
    useFilterModal(defaultSelectionMap);

  useEffect(() => {
    setTimeout(() => {
      if (autoFocus && searchRef && searchRef.current) {
        searchRef.current.focus();
      }
    }, 200);
  }, [autoFocus, searchRef]);

  const _onPressBack = () => {
    searchRef && searchRef.current && searchRef.current.blur();
    onPressBack && onPressBack();
  };

  const renderContent = () => (
    <View style={{ flex: 1 }}>
      {beforeListItem}

      {!isShowCustomContent ? (
        <>
          {withSearchInput && (
            <Search
              autoFocus={false}
              placeholder={placeholder}
              onClearSearchString={() => setSearchString('')}
              onSearch={setSearchString}
              searchText={searchString}
              style={{ marginBottom: searchMarginBottom, marginTop: 8, marginHorizontal: 16 }}
              searchRef={searchRef}
              isShowFilterBtn={isShowFilterBtn}
              onPressFilterBtn={openFilterModal}
              isHasSelectedFilter={!!selectedFilters.length}
            />
          )}
          {isNetConnected ? (
            !isLoadingData &&
            (grouping ? (
              <LazySectionList
                items={items}
                searchString={searchString}
                listStyle={flatListStyle}
                renderItem={renderItem}
                renderListEmptyComponent={renderListEmptyComponent}
                refreshControl={refreshControl}
                searchFunction={searchFunction}
                filterFunction={filterFunction}
                selectedFilters={selectedFilters}
                sortItemFunction={sortFunction}
                sortSectionFunction={grouping.sortSection}
                loading={loading}
                groupBy={grouping.groupBy}
                renderSectionHeader={grouping.renderSectionHeader}
                estimatedItemSize={estimatedItemSize}
                stickyHeader={false}
              />
            ) : (
              <LazyFlatList
                items={items}
                searchString={searchString}
                flatListStyle={flatListStyle}
                renderItem={renderItem}
                renderListEmptyComponent={renderListEmptyComponent}
                refreshControl={refreshControl}
                searchFunction={searchFunction}
                filterFunction={filterFunction}
                selectedFilters={selectedFilters}
                sortFunction={sortFunction}
                loading={loading}
                numberColumns={numberColumns}
                isShowListWrapper={isShowListWrapper}
                estimatedItemSize={estimatedItemSize}
                extraData={extraData}
                keyExtractor={keyExtractor}
                removeClippedSubviews={removeClippedSubviews}
              />
            ))
          ) : (
            <NoInternetScreen />
          )}
        </>
      ) : renderCustomContent ? (
        renderCustomContent()
      ) : (
        <></>
      )}

      {afterListItem}

      {!!(filterOptions && filterOptions.length && filterSelectionMap) && (
        <FilterModal
          filterModalRef={filterModalRef}
          options={filterOptions}
          onChangeOption={onChangeFilterOption}
          optionSelectionMap={filterSelectionMap}
          onApplyFilter={onApplyFilter}
        />
      )}
    </View>
  );

  if (!withSubHeader) {
    return renderContent();
  }

  return (
    <ContainerWithSubHeader
      showLeftBtn={showLeftBtn}
      onPressBack={_onPressBack}
      headerContent={headerContent}
      disabled={!!leftButtonDisabled}
      title={title}
      titleTextAlign={titleTextAlign}
      style={[{ width: '100%' }, style]}
      showRightBtn={!!rightIconOption?.icon}
      rightIcon={rightIconOption?.icon}
      onPressRightIcon={() => {
        Keyboard.dismiss();
        setTimeout(() => rightIconOption?.onPress(), 100);
      }}
      rightButtonTitle={rightIconOption?.title}
      disableRightButton={rightIconOption?.disabled}
      rightIconColor={rightIconOption?.color}
      isShowMainHeader={isShowMainHeader}
      isShowBottomSafeArea={isShowBottomSafeArea}
      androidKeyboardVerticalOffset={androidKeyboardVerticalOffset}>
      {renderContent()}
    </ContainerWithSubHeader>
  );
}
