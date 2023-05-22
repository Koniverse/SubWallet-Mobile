import React, { useEffect, useRef, useState } from 'react';
import { IconProps } from 'phosphor-react-native';
import { ListRenderItemInfo, RefreshControlProps, StyleProp, TextInput, View, ViewStyle } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Search } from 'components/Search';
import { SortFunctionInterface } from 'types/ui-types';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { defaultSortFunc } from 'utils/function';
import i18n from 'utils/i18n/i18n';
import { LazyFlatList } from 'components/LazyFlatList';
import { NoInternetScreen } from 'components/NoInternetScreen';
import FilterModal, { OptionType } from 'components/common/FilterModal';
import { useFilterModal } from 'hooks/useFilterModal';
import { SectionListData } from 'react-native/Libraries/Lists/SectionList';
import { LazySectionList, SectionItem } from 'components/LazySectionList';

//TODO: split FlatList in FlatListScreen to new component, use ImperativeHandle to setPageNumber
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
  searchFunction: (items: T[], searchString: string) => T[];
  filterFunction?: (items: T[], filters: string[]) => T[];
  sortFunction?: SortFunctionInterface<T>;
  searchMarginBottom?: number;
  placeholder?: string;
  numberColumns?: number;
  loading?: boolean;
  flatListStyle?: StyleProp<any>;
  leftButtonDisabled?: boolean;
  headerContent?: () => JSX.Element;
  refreshControl?: React.ReactElement<RefreshControlProps, string | React.JSXElementConstructor<any>>;
  isNetConnected?: boolean;
  isShowFilterBtn?: boolean;
  filterOptions?: OptionType[];
  isShowListWrapper?: boolean;
  grouping?: {
    renderSectionHeader: (info: { section: SectionListData<T> }) => React.ReactElement | null;
    groupBy: (item: T) => string;
    sortSection?: SortFunctionInterface<SectionItem<T>>;
  };
  needGapWithStatusBar?: boolean;
  isShowPlaceHolder?: boolean;
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
  isNetConnected = true,
  isShowFilterBtn,
  filterOptions,
  isShowListWrapper = false,
  beforeListItem,
  grouping,
  needGapWithStatusBar,
  isShowPlaceHolder,
}: Props<T>) {
  const navigation = useNavigation<RootNavigationProps>();
  const [searchString, setSearchString] = useState<string>('');
  const searchRef = useRef<TextInput>(null);
  const {
    filterSelectionMap,
    filterModalVisible,
    openFilterModal,
    onApplyFilter,
    onChangeFilterOption,
    selectedFilters,
    onCloseFilterModal,
  } = useFilterModal();

  useEffect(() => {
    setTimeout(() => {
      if (autoFocus && searchRef && searchRef.current) {
        searchRef.current.focus();
      }
    }, 200);
  }, [autoFocus, searchRef]);

  const _onPressBack = () => {
    searchRef && searchRef.current && searchRef.current.blur();
    onPressBack ? onPressBack() : navigation.canGoBack() && navigation.goBack();
  };

  const renderContent = () => (
    <View style={{ flex: 1 }}>
      {beforeListItem}

      {withSearchInput && (
        <Search
          autoFocus={false}
          placeholder={placeholder}
          onClearSearchString={() => setSearchString('')}
          onSearch={setSearchString}
          searchText={searchString}
          style={{ marginBottom: searchMarginBottom, marginTop: 10, marginHorizontal: 16 }}
          searchRef={searchRef}
          isShowFilterBtn={isShowFilterBtn}
          onPressFilterBtn={openFilterModal}
        />
      )}
      {isNetConnected ? (
        grouping ? (
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
          />
        )
      ) : (
        <NoInternetScreen />
      )}
      {afterListItem}

      {!!(filterOptions && filterOptions.length && filterSelectionMap) && (
        <FilterModal
          options={filterOptions}
          modalVisible={filterModalVisible}
          onChangeOption={onChangeFilterOption}
          optionSelectionMap={filterSelectionMap}
          onApplyFilter={onApplyFilter}
          onChangeModalVisible={onCloseFilterModal}
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
      style={[{ width: '100%' }, style]}
      showRightBtn={!!rightIconOption?.icon}
      rightIcon={rightIconOption?.icon}
      onPressRightIcon={rightIconOption?.onPress}
      rightButtonTitle={rightIconOption?.title}
      disableRightButton={rightIconOption?.disabled}
      rightIconColor={rightIconOption?.color}
      isShowPlaceHolder={isShowPlaceHolder}
      needGapWithStatusBar={needGapWithStatusBar}>
      {renderContent()}
    </ContainerWithSubHeader>
  );
}
