import React from 'react';
import { ScrollView, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import StakingTabStyle from './style';
import { DisabledStyle } from 'styles/sharedStyles';
import { TokenDetailsTab } from 'screens/Home/Crypto/TokenDetailModal';
import { Divider, Typography } from 'components/design-system-ui';

export interface TabItem {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  value: string;
}

interface Props {
  selectedValue: string;
  onSelectType: (type: string) => void;
  tabs: TabItem[];
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  selectedStyle?: ViewStyle;
  textStyle?: TextStyle;
  selectedTextStyle?: TextStyle;
  isShowDivider?: boolean;
  // Lay the tabs out in a horizontal ScrollView instead of a fixed row, for tab sets whose
  // natural width can exceed the screen (e.g. account detail with 3-4 uppercase labels).
  scrollable?: boolean;
}

export function SwTab({
  selectedValue,
  onSelectType,
  tabs,
  containerStyle,
  selectedStyle,
  itemStyle,
  textStyle,
  selectedTextStyle,
  isShowDivider,
  scrollable,
}: Props) {
  const theme = useSubWalletTheme().swThemes;
  const _style = StakingTabStyle(theme);

  const _onSelectType = (value: string) => {
    if (value !== selectedValue) {
      onSelectType(value);
    }
  };

  const tabNodes = tabs.map(item => {
    const _item = item as TokenDetailsTab;
    return (
      <TouchableOpacity
        key={_item.value}
        disabled={_item.disabled}
        activeOpacity={BUTTON_ACTIVE_OPACITY}
        style={[
          { ..._style.item, ...itemStyle },
          selectedValue === _item.value && { ..._style.selectedItem, ...selectedStyle },
          _item.disabled && DisabledStyle,
        ]}
        onPress={() => _onSelectType(_item.value)}>
        <Typography.Text
          style={[{ ..._style.itemText, ...textStyle }, selectedValue === _item.value && selectedTextStyle]}>
          {_item.label}
        </Typography.Text>

        {isShowDivider && (
          <Divider
            type={'horizontal'}
            color={selectedValue === _item.value ? theme.colorSecondary : 'transparent'}
            style={{ paddingTop: 6 }}
          />
        )}
      </TouchableOpacity>
    );
  });

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={_style.scrollContainer}
        contentContainerStyle={[_style.container, containerStyle]}>
        {tabNodes}
      </ScrollView>
    );
  }

  return <View style={[_style.container, containerStyle]}>{tabNodes}</View>;
}
