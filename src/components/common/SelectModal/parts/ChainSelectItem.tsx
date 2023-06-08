import React from 'react';
import { NetworkSelectItem } from 'components/NetworkSelectItem';
import { ChainInfo } from 'types/index';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  onCloseModal?: () => void;
}

export function ChainSelectItem<T>({ item, selectedValueMap, onSelectItem, onCloseModal }: Props<T>) {
  const { name, slug } = item as ChainInfo;
  return (
    <NetworkSelectItem
      itemName={name}
      itemKey={slug}
      onSelectNetwork={() => {
        onSelectItem && onSelectItem(item);
        onCloseModal && onCloseModal();
      }}
      showSeparator={false}
      iconSize={28}
      isSelected={!!selectedValueMap[slug]}
    />
  );
}
