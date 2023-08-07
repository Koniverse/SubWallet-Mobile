import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import React from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  onCloseModal?: () => void;
}

export function AccountSelectItem<T>({ item, selectedValueMap, onSelectItem, onCloseModal }: Props<T>) {
  const { address, name } = item as AccountJson;
  return (
    <AccountItemWithName
      customStyle={{ container: { marginBottom: 8, marginHorizontal: 16 } }}
      avatarSize={24}
      address={address}
      accountName={name}
      isSelected={!!selectedValueMap[address]}
      onPress={() => {
        onSelectItem && onSelectItem(item);
        onCloseModal && onCloseModal();
      }}
    />
  );
}
