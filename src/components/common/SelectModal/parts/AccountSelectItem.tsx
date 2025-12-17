import AccountItemWithName from 'components/common/Account/Item/AccountItemWithName';
import React from 'react';
import { AccountAddressItemType } from 'types/account';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  onCloseModal?: () => void;
  showAccountSignModeIcon?: boolean;
  isShowBitcoinAttr?: boolean;
}

export function AccountSelectItem<T>({
  item,
  selectedValueMap,
  onSelectItem,
  onCloseModal,
  showAccountSignModeIcon,
  isShowBitcoinAttr,
}: Props<T>) {
  const { address, accountName, accountProxyId } = item as AccountAddressItemType;

  return (
    <AccountItemWithName
      isShowBitcoinAttr={isShowBitcoinAttr}
      customStyle={{ container: { marginBottom: 8, marginHorizontal: 16 } }}
      avatarSize={24}
      address={address}
      avatarValue={accountProxyId}
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
