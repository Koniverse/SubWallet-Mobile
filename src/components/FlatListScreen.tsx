import React, { useEffect, useMemo, useRef, useState } from 'react';
import { IconProps } from 'phosphor-react-native';
import { FlatList, ListRenderItemInfo, StyleProp, TextInput, View, ViewStyle } from 'react-native';
import { ScrollViewStyle, sharedStyles } from 'styles/sharedStyles';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { Search } from 'components/Search';
import { HIDE_MODAL_DURATION } from '../constant';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { useLazyList } from 'hooks/useLazyList';
import { ActivityLoading } from 'components/ActivityLoading';
import i18n from 'utils/i18n/i18n';
//TODO: split FlatList in FlatListScreen to new component, use ImperativeHandle to setPageNumber
interface RightIconOpt {
  icon?: (iconProps: IconProps) => JSX.Element;
  title?: string;
  disabled?: boolean;
  onPress: () => void;
}

interface Props<T> {
  items: any[];
  title?: string;
  withSubHeader?: boolean;
  autoFocus: boolean;
  renderListEmptyComponent: () => JSX.Element;
  renderItem?: ({ item }: ListRenderItemInfo<T>) => JSX.Element;
  onPressBack?: () => void;
  showLeftBtn?: boolean;
  style?: StyleProp<any>;
  rightIconOption?: RightIconOpt;
  afterListItem?: JSX.Element;
  filterFunction: (items: T[], searchString: string) => T[];
  placeholder?: string;
  numberColumns?: number;
}

const ColumnWrapperStyle: StyleProp<ViewStyle> = {
  justifyContent: 'space-between',
  marginBottom: 16,
};

export function FlatListScreen<T>({
  items,
  title,
  autoFocus = true,
  onPressBack,
  showLeftBtn = true,
  withSubHeader = true,
  style,
  rightIconOption,
  renderItem,
  afterListItem,
  renderListEmptyComponent,
  filterFunction,
  placeholder = i18n.common.search,
  numberColumns = 1,
}: Props<T>) {
  const navigation = useNavigation<RootNavigationProps>();
  const [searchString, setSearchString] = useState<string>('');
  const filteredItems = useMemo(() => filterFunction(items, searchString), [filterFunction, items, searchString]);
  const { isLoading, lazyList, onLoadMore, setPageNumber } = useLazyList(filteredItems);
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => {
      if (autoFocus && searchRef && searchRef.current) {
        searchRef.current.focus();
      }
    }, HIDE_MODAL_DURATION);
  }, [autoFocus, searchRef]);

  useEffect(() => {
    // Reset page number on change search string => avoid render too many items
    setPageNumber(1);
  }, [searchString, setPageNumber]);

  const _onPressBack = () => {
    searchRef && searchRef.current && searchRef.current.blur();
    onPressBack ? onPressBack() : navigation.canGoBack() && navigation.goBack();
  };

  const children = useMemo(() => {
    const renderLoadingAnimation = () => {
      return isLoading ? <ActivityLoading /> : null;
    };

    return (
      <>
        {lazyList.length ? (
          <FlatList
            style={{ ...ScrollViewStyle }}
            keyboardShouldPersistTaps={'handled'}
            data={lazyList}
            onEndReached={onLoadMore}
            renderItem={renderItem}
            onEndReachedThreshold={0.3}
            numColumns={numberColumns}
            columnWrapperStyle={numberColumns > 1 ? ColumnWrapperStyle : undefined}
            ListFooterComponent={renderLoadingAnimation}
            contentContainerStyle={numberColumns > 1 ? { marginHorizontal: -8 } : undefined}
          />
        ) : (
          renderListEmptyComponent()
        )}
      </>
    );
  }, [isLoading, lazyList, numberColumns, onLoadMore, renderItem, renderListEmptyComponent]);

  const renderContent = () => (
    <View style={{ ...sharedStyles.layoutContainer }}>
      <Search
        autoFocus={false}
        placeholder={placeholder}
        onClearSearchString={() => setSearchString('')}
        onSearch={setSearchString}
        searchText={searchString}
        style={{ marginBottom: 8 }}
        searchRef={searchRef}
      />
      {children}
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
      title={title}
      style={[{ width: '100%' }, style]}
      showRightBtn={!!rightIconOption?.icon}
      rightIcon={rightIconOption?.icon}
      onPressRightIcon={rightIconOption?.onPress}
      rightButtonTitle={rightIconOption?.title}
      disableRightButton={rightIconOption?.disabled}
      isShowPlaceHolder={false}>
      {renderContent()}
    </ContainerWithSubHeader>
  );
}
