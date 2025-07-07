import { OptionType } from 'components/common/SelectModal/type';
import React from 'react';
import InputCheckBox from 'components/Input/InputCheckBox';
import { StyleProp, ViewStyle } from 'react-native';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function FilterSelectItem<T>({ item, selectedValueMap, onSelectItem, style }: Props<T>) {
  const { value, label } = item as OptionType;
  return (
    <InputCheckBox
      style={style}
      key={value}
      checked={selectedValueMap[value]}
      label={label}
      onPress={() => {
        onSelectItem && onSelectItem(item);
      }}
    />
  );
}
