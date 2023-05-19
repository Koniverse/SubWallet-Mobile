import React, { useCallback } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import i18n from 'utils/i18n/i18n';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { ChainInfo } from 'types/index';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';

interface Props {
  modalVisible: boolean;
  onCancel: () => void;
  onSelectItem: (item: ChainInfo) => void;
  items: ChainInfo[];
  title?: string;
  selectedItem?: string;
}

const filterFunction = (items: ChainInfo[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(({ name }) => name.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <EmptyList
      title={'No results found'}
      icon={MagnifyingGlass}
      message={'Please change your search criteria try again'}
    />
  );
};

export const ChainSelector = ({
  modalVisible,
  onCancel,
  onSelectItem,
  items,
  selectedItem,
  title = i18n.title.chain,
}: Props) => {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChainInfo>) => {
      return (
        <NetworkSelectItem
          itemName={item.name}
          itemKey={item.slug}
          onSelectNetwork={() => onSelectItem(item)}
          showSeparator={false}
          iconSize={28}
          isSelected={item.slug === selectedItem}
        />
      );
    },
    [onSelectItem, selectedItem],
  );

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onCancel}>
      <FlatListScreen
        autoFocus={true}
        items={items}
        style={FlatListScreenPaddingTop}
        title={title}
        isShowFilterBtn={false}
        searchFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onCancel}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
