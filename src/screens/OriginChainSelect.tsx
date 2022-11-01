import React from 'react';
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
  onPressBack: () => void;
  networkOptions: { label: string; value: string }[];
  selectedNetworkKey: string;
  onChangeNetwork: (chain: string) => void;
}

const filterFunction = (items: { label: string; value: string }[], searchString: string) => {
  const lowerCaseSearchString = searchString.toLowerCase();
  return items.filter(item => item.label.toLowerCase().includes(lowerCaseSearchString));
};

const renderListEmptyComponent = () => {
  return (
    <Warning title={i18n.warningTitle.warning} message={i18n.warningMessage.noNetworkAvailable} isDanger={false} />
  );
};

export const OriginChainSelect = ({
  modalVisible,
  onChangeModalVisible,
  selectedNetworkKey,
  onChangeNetwork,
  onPressBack,
  networkOptions,
}: Props) => {
  const renderItem = ({ item }: ListRenderItemInfo<{ label: string; value: string }>) => {
    return (
      <NetworkSelectItem
        itemName={item.label}
        itemKey={item.value}
        isSelected={item.value === selectedNetworkKey}
        onSelectNetwork={() => onChangeNetwork(item.value)}
        showSeparator={false}
        iconSize={20}
      />
    );
  };

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        autoFocus={true}
        items={networkOptions}
        style={FlatListScreenPaddingTop}
        title={i18n.sendAssetScreen.originChain}
        filterFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onPressBack}
        renderListEmptyComponent={renderListEmptyComponent}
      />
    </SubWalletFullSizeModal>
  );
};
