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
  selectedItem?: string;
}

const filterFunction = (items: TokenItemType[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(({ symbol }) => symbol.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      icon={MagnifyingGlass}
      title={'No results found'}
      message={'Please change your search criteria try again'}
    />
  );
};

export const TokenSelector = ({
  modalVisible,
  onCancel,
  onSelectItem,
  items,
  acceptDefaultValue,
  title = 'Select token',
  defaultValue,
  selectedItem,
}: Props) => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
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
          isSelected={item.slug === selectedItem}
          onSelectNetwork={() => onSelectItem(item)}
        />
      );
    },
    [chainInfoMap, onSelectItem, selectedItem],
  );

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <FlatListScreen
        autoFocus={true}
        items={items}
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
