import React from 'react';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { Keyboard, ListRenderItemInfo } from 'react-native';
import { ModalRef } from 'types/modalRef';
import { AccountAddressItemType } from 'types/account';
import { VoidFunction } from 'types/index';

interface Props {
  items: AccountAddressItemType[];
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: AccountAddressItemType) => void;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  accountSelectorRef?: React.MutableRefObject<ModalRef | undefined>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: ({ item }: ListRenderItemInfo<AccountAddressItemType>) => JSX.Element;
  onCloseModal?: VoidFunction;
}

export const AccountSelector = ({
  items,
  selectedValueMap,
  onSelectItem,
  disabled,
  renderSelected,
  accountSelectorRef,
  closeModalAfterSelect,
  isShowContent,
  isShowInput,
  children,
  renderCustomItem,
  onCloseModal,
}: Props) => {
  const _onSelectItem = (item: AccountAddressItemType) => {
    Keyboard.dismiss();
    onSelectItem && onSelectItem(item);
  };

  return (
    <FullSizeSelectModal
      items={items}
      selectedValueMap={selectedValueMap}
      onSelectItem={_onSelectItem}
      selectModalType={'single'}
      selectModalItemType={'account'}
      disabled={disabled}
      renderSelected={renderSelected}
      placeholder={i18n.placeholder.accountName}
      title={i18n.header.selectAccount}
      ref={accountSelectorRef}
      closeModalAfterSelect={closeModalAfterSelect}
      isShowContent={isShowContent}
      renderCustomItem={renderCustomItem}
      estimatedItemSize={60}
      onCloseModal={onCloseModal}
      isShowInput={isShowInput}>
      {children}
    </FullSizeSelectModal>
  );
};
