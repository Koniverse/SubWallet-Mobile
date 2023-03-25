import React from 'react';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import { FlatListScreen } from 'components/FlatListScreen';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { ListRenderItemInfo } from 'react-native';
import { NetworkSelectItem } from 'components/NetworkSelectItem';

interface Props {
  modalVisible: boolean;
  onPressBack?: () => void;
  onChangeModalVisible: () => void;
  onChangeNetwork?: (networkKey: string) => void;
  selectedNetworkKey?: string;
  networkOptions: { label: string; value: string }[];
}

const filterFunction = (items: { label: string; value: string }[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(item => item.label.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <Warning
      style={{ marginHorizontal: 16 }}
      title={i18n.warningTitle.warning}
      message={i18n.warningMessage.noNetworkAvailable}
      isDanger={false}
    />
  );
};

export const NetworkModal = ({
  onPressBack,
  onChangeNetwork,
  selectedNetworkKey,
  modalVisible,
  onChangeModalVisible,
  networkOptions,
}: Props) => {
  const renderItem = ({ item }: ListRenderItemInfo<{ label: string; value: string }>) => {
    return (
      <NetworkSelectItem
        key={item.value}
        itemName={item.label}
        itemKey={item.value}
        isSelected={item.value === selectedNetworkKey}
        onSelectNetwork={() => onChangeNetwork && onChangeNetwork(item.value)}
        defaultItemKey={item.value}
      />
    );
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        autoFocus={true}
        items={networkOptions}
        style={FlatListScreenPaddingTop}
        title={i18n.title.network}
        searchFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onPressBack}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
