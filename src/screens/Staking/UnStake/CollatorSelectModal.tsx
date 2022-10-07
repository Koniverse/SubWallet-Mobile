import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import CollatorSelectItem from 'components/Staking/CollatorSelectItem';
import React, { useCallback } from 'react';
import { SubWalletFullSizeModal } from 'components/SubWalletFullSizeModal';
import { FlatListScreen } from 'components/FlatListScreen';
import { ListRenderItemInfo } from 'react-native';
import { FlatListScreenPaddingTop } from 'styles/sharedStyles';
import { EmptyList } from 'components/EmptyList';
import { Aperture } from 'phosphor-react-native';
import i18n from 'utils/i18n/i18n';

interface Props {
  delegations: DelegationItem[];
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  onChangeValue: (text: string) => void;
  selectedItem: string;
}

const filterFunction = (items: DelegationItem[], searchString: string) => {
  return items.filter(
    item =>
      item.identity?.toLowerCase().includes(searchString.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchString.toLowerCase()),
  );
};

const CollatorSelectModal = ({
  modalVisible,
  onChangeModalVisible,
  delegations,
  onChangeValue,
  selectedItem,
}: Props) => {
  const onSelect = useCallback(
    (item: DelegationItem) => {
      return () => {
        onChangeValue(item.owner);
        onChangeModalVisible();
      };
    },
    [onChangeModalVisible, onChangeValue],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<DelegationItem>) => {
      const selected = item.owner === selectedItem;

      return <CollatorSelectItem collator={item} isSelected={selected} onSelect={onSelect(item)} />;
    },
    [onSelect, selectedItem],
  );

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        style={FlatListScreenPaddingTop}
        title={i18n.title.chainSelect}
        autoFocus={true}
        items={delegations}
        renderListEmptyComponent={() => <EmptyList title={i18n.common.noEvmChainAvailable} icon={Aperture} />}
        filterFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onChangeModalVisible}
      />
    </SubWalletFullSizeModal>
  );
};

export default React.memo(CollatorSelectModal);
