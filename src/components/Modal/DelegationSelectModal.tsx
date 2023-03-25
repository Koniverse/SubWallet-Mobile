import { DelegationItem } from '@subwallet/extension-base/background/KoniTypes';
import DelegationSelectItem from 'components/Staking/DelegationSelectItem';
import useGetValidatorType from 'hooks/screen/Staking/useGetValidatorType';
import React, { useCallback, useMemo } from 'react';
import { SubWalletFullSizeModal } from 'components/Modal/Base/SubWalletFullSizeModal';
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
  networkKey: string;
}

const filterFunction = (items: DelegationItem[], searchString: string) => {
  return items.filter(
    item =>
      item.identity?.toLowerCase().includes(searchString.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchString.toLowerCase()),
  );
};

const DelegationSelectModal = ({
  modalVisible,
  onChangeModalVisible,
  delegations,
  onChangeValue,
  selectedItem,
  networkKey,
}: Props) => {
  const validatorType = useGetValidatorType(networkKey);

  const headerTitle = useMemo((): string => {
    switch (validatorType) {
      case 'Collator':
        return i18n.title.collators;
      case 'DApp':
        return i18n.title.dApps;
      case 'Validator':
      case 'Unknown':
      default:
        return i18n.title.validators;
    }
  }, [validatorType]);

  const noItemMessage = useMemo(() => {
    switch (validatorType) {
      case 'Collator':
        return i18n.stakingScreen.validatorList.noCollatorAvailable;
      case 'DApp':
        return i18n.stakingScreen.validatorList.noDAppAvailable;
      case 'Validator':
      case 'Unknown':
      default:
        return i18n.stakingScreen.validatorList.noValidatorAvailable;
    }
  }, [validatorType]);

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

      return <DelegationSelectItem collator={item} isSelected={selected} onSelect={onSelect(item)} />;
    },
    [onSelect, selectedItem],
  );

  return (
    <SubWalletFullSizeModal modalVisible={modalVisible} onChangeModalVisible={onChangeModalVisible}>
      <FlatListScreen
        style={FlatListScreenPaddingTop}
        title={headerTitle}
        autoFocus={true}
        items={delegations}
        renderListEmptyComponent={() => <EmptyList title={noItemMessage} icon={Aperture} />}
        searchFunction={filterFunction}
        renderItem={renderItem}
        onPressBack={onChangeModalVisible}
      />
    </SubWalletFullSizeModal>
  );
};

export default React.memo(DelegationSelectModal);
