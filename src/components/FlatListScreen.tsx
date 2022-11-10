import React, { useEffect, useRef, useState } from 'react';
import { IconProps } from 'phosphor-react-native';
import { ListRenderItemInfo, RefreshControlProps, StyleProp, TextInput, View } from 'react-native';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Search } from 'components/Search';
import { SortFunctionInterface } from 'types/ui-types';
import { HIDE_MODAL_DURATION } from 'constants/index';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { defaultSortFunc } from 'utils/function';
import i18n from 'utils/i18n/i18n';
import { LazyFlatList } from 'components/LazyFlatList';
import { NoInternetScreen } from 'components/NoInternetScreen';

//TODO: split FlatList in FlatListScreen to new component, use ImperativeHandle to setPageNumber
interface RightIconOpt {
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
  autoFocus: boolean;
  renderListEmptyComponent: (searchString?: string) => JSX.Element;
  renderItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  onPressBack?: () => void;
  showLeftBtn?: boolean;
  style?: StyleProp<any>;
  rightIconOption?: RightIconOpt;
  afterListItem?: JSX.Element;
  filterFunction: (items: T[], searchString: string) => T[];
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
  filterFunction,
  placeholder = i18n.common.search,
  numberColumns = 1,
  searchMarginBottom = 8,
  sortFunction = defaultSortFunc,
  flatListStyle,
  leftButtonDisabled,
  headerContent,
  refreshControl,
  isNetConnected = true,
}: Props<T>) {
  const navigation = useNavigation<RootNavigationProps>();
  const [searchString, setSearchString] = useState<string>('');
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      if (autoFocus && searchRef && searchRef.current) {
        searchRef.current.focus();
      }
    }, HIDE_MODAL_DURATION);
  }, [autoFocus, searchRef]);

  const _onPressBack = () => {
    searchRef && searchRef.current && searchRef.current.blur();
    onPressBack ? onPressBack() : navigation.canGoBack() && navigation.goBack();
  };

  const renderContent = () => (
    <View style={{ flex: 1 }}>
      {withSearchInput && (
        <Search
          autoFocus={false}
          placeholder={placeholder}
          onClearSearchString={() => setSearchString('')}
          onSearch={setSearchString}
          searchText={searchString}
          style={{ marginBottom: searchMarginBottom, marginTop: 10, marginHorizontal: 16 }}
          searchRef={searchRef}
        />
      )}
      {isNetConnected ? (
        <LazyFlatList
          items={items}
          searchString={searchString}
          flatListStyle={flatListStyle}
          renderItem={renderItem}
          renderListEmptyComponent={renderListEmptyComponent}
          refreshControl={refreshControl}
          filterFunction={filterFunction}
          sortFunction={sortFunction}
          loading={loading}
          numberColumns={numberColumns}
        />
      ) : (
        <NoInternetScreen />
      )}
      {afterListItem}
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
      isShowPlaceHolder={false}>
      {renderContent()}
    </ContainerWithSubHeader>
  );
}
