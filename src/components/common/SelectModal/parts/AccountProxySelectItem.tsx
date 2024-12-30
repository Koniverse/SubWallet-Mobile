import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import React from 'react';
import { AccountProxyItem } from 'screens/Account/AccountsScreen';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  onCloseModal?: () => void;
  showAccountSignModeIcon?: boolean;
}

export function AccountProxySelectItem<T>({
  item,
  selectedValueMap,
  onSelectItem,
  onCloseModal,
  showAccountSignModeIcon,
}: Props<T>) {
  const { id, name } = item as AccountProxyItem;

  return (
    <AccountItemWithName
      customStyle={{ container: { marginBottom: 8, marginHorizontal: 16 } }}
      avatarSize={24}
      address={id}
      accountName={name}
      isSelected={!!selectedValueMap[id]}
      showAccountSignModeIcon={showAccountSignModeIcon}
      onPress={() => {
        onSelectItem && onSelectItem(item);
        onCloseModal && onCloseModal();
      }}
    />
  );
}
