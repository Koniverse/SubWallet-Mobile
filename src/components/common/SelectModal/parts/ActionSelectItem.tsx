import { ActionItemType } from 'components/common/SelectModal/type';
import { SelectItem } from 'components/design-system-ui';
import React from 'react';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  onCloseModal?: () => void;
}

export function ActionSelectItem<T>({ item, selectedValueMap, onSelectItem, onCloseModal }: Props<T>) {
  const { label, backgroundColor, icon, key } = item as ActionItemType;
  return (
    <SelectItem
      label={label}
      backgroundColor={backgroundColor}
      icon={icon}
      onPress={() => {
        onSelectItem && onSelectItem(item);
        onCloseModal && onCloseModal();
      }}
      isSelected={!!selectedValueMap[key]}
    />
  );
}
