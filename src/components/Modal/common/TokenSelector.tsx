import React, { useCallback, useEffect, useMemo } from 'react';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { BalanceValueInfo } from 'types/balance';
import { CurrencyJson } from '@subwallet/extension-base/background/KoniTypes';
import { OptionType } from 'components/common/FilterModal';

export type TokenItemType = {
  name: string;
  slug: string;
  symbol: string;
  originChain: string;
};

export type TokenSelectorItemType = {
  name: string;
  slug: string;
  symbol: string;
  originChain: string;
  balanceInfo?: {
    isReady: boolean;
    isNotSupport: boolean;
    isTestnet: boolean;
    free: BalanceValueInfo;
    locked: BalanceValueInfo;
    total: BalanceValueInfo;
    currency?: CurrencyJson;
  };
  showBalance?: boolean;
};

interface Props {
  items: TokenSelectorItemType[];
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: TokenSelectorItemType) => void;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  tokenSelectorRef?: React.MutableRefObject<ModalRef | undefined>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: ({ item }: ListRenderItemInfo<TokenSelectorItemType>) => JSX.Element;
  defaultValue?: string;
  acceptDefaultValue?: boolean;
  onCloseAccountSelector?: () => void;
  selectedValue?: string;
  showAddBtn?: boolean;
  isShowFilterBtn?: boolean;
  filterFunction?: (items: TokenSelectorItemType[], filters: string[]) => TokenSelectorItemType[];
  filterOptions?: OptionType[];
}

export const TokenSelector = ({
  items,
  selectedValueMap,
  onSelectItem,
  disabled,
  renderSelected,
  tokenSelectorRef,
  closeModalAfterSelect,
  isShowContent,
  isShowInput,
  children,
  renderCustomItem,
  defaultValue,
  acceptDefaultValue,
  onCloseAccountSelector,
  selectedValue,
  showAddBtn = true,
  isShowFilterBtn,
  filterFunction,
  filterOptions,
}: Props) => {
  const chainInfoMap = useSelector((root: RootState) => root.chainStore.chainInfoMap);
  const navigation = useNavigation<RootNavigationProps>();
  useEffect(() => {
    setAdjustPan();
  }, []);

  const _onSelectItem = (item: TokenSelectorItemType) => {
    onSelectItem && onSelectItem(item);
  };

  const renderListEmptyComponent = useCallback(() => {
    return (
      <EmptyList
        icon={MagnifyingGlass}
        title={i18n.emptyScreen.selectorEmptyTitle}
        message={i18n.emptyScreen.selectorEmptyMessage}
        addBtnLabel={showAddBtn ? i18n.header.importToken : undefined}
        onPressAddBtn={
          showAddBtn
            ? () => {
                onCloseAccountSelector && onCloseAccountSelector();
                tokenSelectorRef?.current?.onCloseModal();
                navigation.navigate('ImportToken');
              }
            : undefined
        }
      />
    );
  }, [navigation, onCloseAccountSelector, showAddBtn, tokenSelectorRef]);

  const searchFunc = useCallback(
    (_items: TokenSelectorItemType[], searchString: string) => {
      const lowerCaseSearchString = searchString.toLowerCase();

      const filteredList = (_items as TokenSelectorItemType[]).filter(
        ({ symbol, originChain }) =>
          symbol.toLowerCase().includes(lowerCaseSearchString) ||
          chainInfoMap[originChain]?.name?.toLowerCase().includes(lowerCaseSearchString),
      );

      if (lowerCaseSearchString === 'ton') {
        const tonItemIndex = filteredList.findIndex(item => item.slug === 'ton-NATIVE-TON');

        if (tonItemIndex !== -1) {
          const [tonItem] = filteredList.splice(tonItemIndex, 1);

          if (tonItem) {
            filteredList.unshift(tonItem);
          }
        }

        return filteredList;
      } else {
        return filteredList;
      }
    },
    [chainInfoMap],
  );

  const selectedItem = useMemo(() => {
    if (!selectedValue) {
      return undefined;
    }

    return items.find(i => i.slug === selectedValue);
  }, [items, selectedValue]);

  const sortedList = useMemo(() => {
    let result = items;

    if (selectedItem) {
      result = result.filter(i => i.slug !== selectedItem.slug);

      result.unshift(selectedItem);
    }

    return result;
  }, [items, selectedItem]);

  const filterModalSearchFunc = useCallback((_items: OptionType[], searchString: string) => {
    const lowerCaseSearchString = searchString.toLowerCase();

    return _items.filter(item => item.label.toLowerCase().includes(lowerCaseSearchString));
  }, []);

  return (
    <FullSizeSelectModal
      items={sortedList}
      selectedValueMap={selectedValueMap}
      selectModalType={'single'}
      selectModalItemType={'token'}
      searchFunc={searchFunc}
      title={i18n.header.selectToken}
      onSelectItem={_onSelectItem}
      ref={tokenSelectorRef}
      renderSelected={renderSelected}
      placeholder={i18n.placeholder.searchTokenNameOrNetworkName}
      closeModalAfterSelect={closeModalAfterSelect}
      isShowContent={isShowContent}
      isShowInput={isShowInput}
      renderCustomItem={renderCustomItem}
      defaultValue={defaultValue}
      acceptDefaultValue={acceptDefaultValue}
      renderListEmptyComponent={renderListEmptyComponent}
      isShowFilterBtn={isShowFilterBtn}
      filterFunction={filterFunction}
      filterOptions={filterOptions}
      filterModalSearchFunc={filterModalSearchFunc}
      isFilterFullSize={true}
      disabled={disabled}>
      {children}
    </FullSizeSelectModal>
  );
};
