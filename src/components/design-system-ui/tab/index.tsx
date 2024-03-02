import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import StakingTabStyle from './style';
import { DisabledStyle } from 'styles/sharedStyles';
import { TokenDetailsTab } from 'screens/Home/Crypto/TokenDetailModal';

interface Props<T> {
  selectedValue: string;
  onSelectType: (type: string) => void;
  tabs: T[];
  tabType: 'tokenDetail';
}

export function SwTab<T>({ selectedValue, onSelectType, tabs, tabType }: Props<T>) {
  const theme = useSubWalletTheme().swThemes;
  const _style = StakingTabStyle(theme);

  const _onSelectType = (value: string) => {
    if (value !== selectedValue) {
      onSelectType(value);
    }
  };

  return (
    <View style={_style.container}>
      {tabs.map(item => {
        if (tabType === 'tokenDetail') {
          const _item = item as TokenDetailsTab;
          return (
            <TouchableOpacity
              key={_item.value}
              disabled={_item.disabled}
              activeOpacity={BUTTON_ACTIVE_OPACITY}
              style={[
                _style.item,
                selectedValue === _item.value && _style.selectedItem,
                _item.disabled && DisabledStyle,
              ]}
              onPress={() => _onSelectType(_item.value)}>
              <Text style={_style.itemText}>{_item.label}</Text>
            </TouchableOpacity>
          );
        }
      })}
    </View>
  );
}
