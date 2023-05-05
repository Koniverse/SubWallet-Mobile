import React from 'react';
import { Button, Divider, Icon, SwModal } from 'components/design-system-ui';
import { Text, View } from 'react-native';
import InputCheckBox from 'components/Input/InputCheckBox';
import { FadersHorizontal } from 'phosphor-react-native';
import { MarginBottomForSubmitButton } from 'styles/sharedStyles';

export type OptionType = {
  label: string;
  value: string;
};

export interface FilterModalProps {
  modalTitle?: string;
  modalVisible: boolean;
  options: OptionType[];
  onChangeOption?: (value: string, isChecked: boolean) => void;
  onApplyFilter?: () => void;
  onChangeModalVisible?: () => void;
  optionSelectionMap: Record<string, boolean>;
}

const FilterModal = ({
  modalVisible,
  onChangeModalVisible,
  options,
  modalTitle = 'Filter',
  onChangeOption,
  onApplyFilter,
  optionSelectionMap,
}: FilterModalProps) => {
  const renderFooter = () => {
    return (
      <>
        <Divider style={{ paddingTop: 4, paddingBottom: 16 }} color={'#1A1A1A'} />
        <View style={{ width: '100%', paddingHorizontal: 16, ...MarginBottomForSubmitButton }}>
          <Button
            icon={<Icon phosphorIcon={FadersHorizontal} size={'lg'} />}
            onPress={() => {
              onChangeModalVisible && onChangeModalVisible();
              onApplyFilter && onApplyFilter();
            }}>
            {'Apply filter'}
          </Button>
        </View>
      </>
    );
  };

  return (
    <SwModal
      modalVisible={modalVisible}
      modalTitle={modalTitle}
      onChangeModalVisible={onChangeModalVisible}
      footer={renderFooter()}>
      <View style={{ width: '100%' }}>
        {options.map(item => (
          <InputCheckBox
            key={item.value}
            checked={optionSelectionMap[item.value]}
            label={item.label}
            onPress={() => onChangeOption && onChangeOption(item.value, !optionSelectionMap[item.value])}
          />
        ))}
      </View>
    </SwModal>
  );
};

export default FilterModal;
