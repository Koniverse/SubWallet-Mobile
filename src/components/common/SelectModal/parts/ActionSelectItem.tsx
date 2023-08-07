import { ActionItemType } from 'components/common/SelectModal/type';
import { SelectItem } from 'components/design-system-ui';
import React from 'react';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T, isCheck?: boolean) => void;
}

export function ActionSelectItem<T>({ item, selectedValueMap, onSelectItem }: Props<T>) {
  const { label, backgroundColor, icon, key } = item as ActionItemType;
  return (
    <SelectItem
      label={label}
      backgroundColor={backgroundColor}
      icon={icon}
      onPress={() => {
        onSelectItem && onSelectItem(item);
      }}
      isSelected={!!selectedValueMap[key]}
    />
  );
}
