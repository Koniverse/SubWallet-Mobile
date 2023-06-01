import React from 'react';
import { SelectItem, SwModal } from 'components/design-system-ui';
import { TokenTypeSelectField } from 'components/Field/TokenTypeSelect';
import { TouchableOpacity, View } from 'react-native';
import { Coin } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { DisabledStyle } from 'styles/sharedStyles';
import { AssetTypeOption } from '../../../types/asset';
import i18n from 'utils/i18n/i18n';

interface Props {
  modalVisible: boolean;
  items: AssetTypeOption[];
  onSelectItem: (item: AssetTypeOption) => void;
  selectedValue?: string;
  onPress?: () => void;
  onChangeModalVisible?: () => void;
  disabled?: boolean;
}

export const TokenTypeSelector = ({
  modalVisible,
  items,
  selectedValue,
  onPress,
  onChangeModalVisible,
  disabled,
  onSelectItem,
}: Props) => {
  const theme = useSubWalletTheme().swThemes;
  return (
    <>
      <TouchableOpacity onPress={onPress} disabled={disabled} style={disabled && DisabledStyle}>
        <TokenTypeSelectField value={selectedValue} showIcon />
      </TouchableOpacity>

      <SwModal
        modalVisible={modalVisible}
        modalTitle={i18n.header.selectTokenType}
        onChangeModalVisible={onChangeModalVisible}>
        <View style={{ width: '100%' }}>
          {items.map(item => (
            <SelectItem
              onPress={() => onSelectItem(item)}
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
