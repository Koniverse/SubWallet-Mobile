import React, { useCallback, useEffect } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenSelectItem } from 'components/TokenSelectItem';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

export type TokenItemType = {
  name: string;
  slug: string;
  symbol: string;
  originChain: string;
};

interface Props {
  modalVisible: boolean;
  onCancel: () => void;
  onSelectItem: (item: TokenItemType) => void;
  items: TokenItemType[];
  title?: string;
  defaultValue?: string;
  acceptDefaultValue?: boolean;
  selectedValue?: string;
}

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      icon={MagnifyingGlass}
      title={i18n.emptyScreen.selectorEmptyTitle}
      message={i18n.emptyScreen.selectorEmptyMessage}
    />
  );
};

export const TokenSelector = ({
  modalVisible,
  onCancel,
  onSelectItem,
  items,
  acceptDefaultValue,
  title = i18n.header.selectToken,
  defaultValue,
  selectedValue,
}: Props) => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  const filterFunction = useCallback(
    (rawItems: TokenItemType[], searchString: string) => {
      const lowerCaseSearchString = searchString.toLowerCase();
      return rawItems.filter(
        ({ symbol, originChain }) =>
          symbol.toLowerCase().includes(lowerCaseSearchString) ||
          chainInfoMap[originChain]?.name?.toLowerCase().includes(lowerCaseSearchString),
      );
    },
    [chainInfoMap],
  );
  useEffect(() => {
    if (acceptDefaultValue) {
      if (!defaultValue) {
        items[0] && onSelectItem(items[0]);
      } else {
        const existed = items.find(item => item.slug === defaultValue);

        if (!existed) {
          items[0] && onSelectItem(items[0]);
        } else {
          onSelectItem(existed);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, defaultValue]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TokenItemType>) => {
      const { symbol, originChain } = item;

      return (
        <TokenSelectItem
          key={`${symbol}-${originChain}`}
          symbol={symbol}
          chain={`${chainInfoMap[originChain]?.name || ''}`}
          logoKey={symbol.toLowerCase()}
          subLogoKey={originChain}
          isSelected={item.slug === selectedValue}
          onSelectNetwork={() => onSelectItem(item)}
        />
      );
    },
    [chainInfoMap, onSelectItem, selectedValue],
  );

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <FlatListScreen
        autoFocus={true}
        items={items}
        placeholder={i18n.placeholder.searchToken}
        style={FlatListScreenPaddingTop}
        title={title}
        searchFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onCancel}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
