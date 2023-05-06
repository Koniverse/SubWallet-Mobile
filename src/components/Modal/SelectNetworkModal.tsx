import React, { useCallback } from 'react';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
import i18n from 'utils/i18n/i18n';
import { Warning } from 'components/Warning';
import { ListRenderItemInfo } from 'react-native';
import { FlatListScreen } from 'components/FlatListScreen';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';

interface Props {
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  title: string;
  onPressBack: () => void;
  networkOptions: { label: string; value: string }[];
  selectedNetworkKey: string;
  onChangeNetwork: (chain: string) => void;
  renderEmptyList?: () => JSX.Element;
}

const searchFunction = (items: { label: string; value: string }[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(item => item.label.toLowerCase().includes(lowerCaseSearchString));
};

const defaultRenderListEmptyComponent = () => {
  return (
    <Warning
      style={{ marginHorizontal: 16 }}
      title={i18n.warningTitle.warning}
      message={i18n.warningMessage.noNetworkAvailable}
      isDanger={false}
    />
  );
};

const SelectNetworkModal = ({
  modalVisible,
  onChangeModalVisible,
  selectedNetworkKey,
  onChangeNetwork,
  onPressBack,
  title,
  networkOptions,
  renderEmptyList,
}: Props) => {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<{ label: string; value: string }>) => {
      return (
        <NetworkSelectItem
          itemName={item.label}
          itemKey={item.value}
          isSelected={item.value === selectedNetworkKey}
          onSelectNetwork={() => onChangeNetwork(item.value)}
          showSeparator={false}
        />
      );
    },
    [onChangeNetwork, selectedNetworkKey],
  );

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        autoFocus={true}
        items={networkOptions}
        style={FlatListScreenPaddingTop}
        title={title}
        searchFunction={searchFunction}
        renderItem={renderItem}
        onPressBack={onPressBack}
        renderListEmptyComponent={renderEmptyList ? renderEmptyList : defaultRenderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};

export default React.memo(SelectNetworkModal);
