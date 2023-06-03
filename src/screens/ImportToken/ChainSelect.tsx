import React from 'react';
import { Item } from 'react-native-picker-select';
import { EmptyList } from 'components/EmptyList';
import { MagnifyingGlass } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';
import SelectNetworkModal from 'components/Modal/SelectNetworkModal';

interface Props {
  items: Item[];
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  onChangeValue: (text: string) => void;
  selectedItem: string;
}

const renderEmpty = () => (
  <EmptyList
    title={i18n.emptyScreen.selectorEmptyTitle}
    message={i18n.emptyScreen.selectorEmptyMessage}
    icon={MagnifyingGlass}
  />
);

export const ChainSelect = ({ modalVisible, onChangeModalVisible, items, onChangeValue, selectedItem }: Props) => {
  return (
    <SelectNetworkModal
      onPressBack={onChangeModalVisible}
      modalVisible={modalVisible}
      onChangeModalVisible={onChangeModalVisible}
      networkOptions={items}
      selectedNetworkKey={selectedItem}
      onChangeNetwork={onChangeValue}
      title={i18n.title.chainSelect}
      renderEmptyList={renderEmpty}
    />
  );
};
