import React from 'react';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { FlatListScreen } from 'components/FlatListScreen';
import { Item } from 'react-native-picker-select';
import { ListRenderItemInfo } from 'react-native';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { EmptyList } from 'components/EmptyList';
import { Aperture } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  items: Item[];
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  onChangeValue: (text: string) => void;
  selectedItem: string;
}

const filterFunction = (items: Item[], searchString: string) => {
  return items.filter(item => item.label.toLowerCase().includes(searchString.toLowerCase()));
};

const formatItemList = (items: Item[]) => {
  if (items.length === 1 && !items[0].value) {
    return [] as Item[];
  } else {
    return items;
  }
};

export const ChainSelect = ({ modalVisible, onChangeModalVisible, items, onChangeValue, selectedItem }: Props) => {
  const formattedItemList = formatItemList(items);

  const renderItem = ({ item }: ListRenderItemInfo<Item>) => {
    return (
      <NetworkSelectItem
        isSelected={item.value === selectedItem}
        itemName={item.label}
        itemKey={item.value}
        onSelectNetwork={() => onChangeValue(item.value)}
      />
    );
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        style={FlatListScreenPaddingTop}
        title={i18n.title.chainSelect}
        autoFocus={true}
        items={formattedItemList}
        renderListEmptyComponent={() => <EmptyList title={i18n.common.noChainAvailable} icon={Aperture} />}
        filterFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onChangeModalVisible}
      />
    </SubWalletFullSizeModal>
  );
};
