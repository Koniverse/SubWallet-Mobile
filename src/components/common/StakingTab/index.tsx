import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import StakingTabStyle from './style';
import { StakingType } from '@subwallet/extension-base/background/KoniTypes';

interface Props {
  selectedType: StakingType;
  onSelectType: (type: StakingType) => void;
}

export const StakingTab = ({ selectedType, onSelectType }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const _style = StakingTabStyle(theme);

  const _onSelectType = (value: StakingType) => {
    if (value !== selectedType) {
      onSelectType(value);
    }
  };

  return (
    <View style={_style.container}>
      <TouchableOpacity
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        style={[_style.item, selectedType === StakingType.POOLED && _style.selectedItem]}
        onPress={() => _onSelectType(StakingType.POOLED)}>
        <Text style={_style.itemText}>Pools</Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        style={[_style.item, selectedType === StakingType.NOMINATED && _style.selectedItem]}
        onPress={() => _onSelectType(StakingType.NOMINATED)}>
        <Text style={_style.itemText}>Nominate</Text>
      </TouchableOpacity>
    </View>
  );
};
