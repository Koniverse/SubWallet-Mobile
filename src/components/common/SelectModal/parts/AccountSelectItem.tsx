import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import React from 'react';
import { AccountAddressItemType } from 'types/account';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  onCloseModal?: () => void;
  showAccountSignModeIcon?: boolean;
}

export function AccountSelectItem<T>({
  item,
  selectedValueMap,
  onSelectItem,
  onCloseModal,
  showAccountSignModeIcon,
}: Props<T>) {
  const { address, accountName } = item as AccountAddressItemType;

  return (
    <AccountItemWithName
      customStyle={{ container: { marginBottom: 8, marginHorizontal: 16 } }}
      avatarSize={24}
      address={address}
      accountName={accountName}
      isSelected={!!selectedValueMap[address]}
      showAccountSignModeIcon={showAccountSignModeIcon}
      onPress={() => {
        onSelectItem && onSelectItem(item);
        onCloseModal && onCloseModal();
      }}
    />
  );
}
