import { OptionType } from 'components/common/SelectModal/type';
import React from 'react';
import InputCheckBox from 'components/Input/InputCheckBox';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
}

export function FilterSelectItem<T>({ item, selectedValueMap, onSelectItem }: Props<T>) {
  const { value, label } = item as OptionType;
  return (
    <InputCheckBox
      key={value}
      checked={!!selectedValueMap[value]}
      label={label}
      onPress={() => {
        onSelectItem && onSelectItem(item);
      }}
    />
  );
}
