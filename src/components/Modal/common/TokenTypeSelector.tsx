import React from 'react';
import { SelectItem, SwModal } from 'components/design-system-ui';
import { NftTypeOption } from 'screens/ImportToken/ImportNft';
import { TokenTypeSelectField } from 'components/Field/TokenTypeSelect';
import { View, TouchableOpacity } from 'react-native';
import { Coin } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  modalVisible: boolean;
  items: NftTypeOption[];
  selectedValue?: string;
  onPress?: () => void;
  onChangeModalVisible?: () => void;
}

export const TokenTypeSelector = ({ modalVisible, items, selectedValue, onPress, onChangeModalVisible }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <TokenTypeSelectField value={selectedValue} showIcon />
      </TouchableOpacity>

      <SwModal modalVisible={modalVisible} modalTitle={'Select token type'} onChangeModalVisible={onChangeModalVisible}>
        <View style={{ width: '100%' }}>
          {items.map(item => (
            <SelectItem
              icon={Coin}
              key={item.value}
              label={item.label}
              isSelected={item.value === selectedValue}
              backgroundColor={theme['orange-6']}
            />
          ))}
        </View>
      </SwModal>
    </>
  );
};
