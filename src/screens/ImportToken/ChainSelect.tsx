import React from 'react';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { FlatListScreen } from 'components/FlatListScreen';
import { Item } from 'react-native-picker-select';
import { ListRenderItemInfo } from 'react-native';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';

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

export const ChainSelect = ({ modalVisible, onChangeModalVisible, items, onChangeValue, selectedItem }: Props) => {
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
        title={'Chain Select'}
        autoFocus={true}
        items={items}
        renderListEmptyComponent={() => <></>}
        filterFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onChangeModalVisible}
      />
    </SubWalletFullSizeModal>
  );
};
