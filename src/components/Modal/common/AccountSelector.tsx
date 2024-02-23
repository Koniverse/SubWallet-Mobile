import React from 'react';
import { AccountJson } from '@subwallet/extension-base/background/types';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { Keyboard, ListRenderItemInfo } from 'react-native';
import { ModalRef } from 'types/modalRef';

interface Props {
  items: AccountJson[];
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: AccountJson) => void;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  accountSelectorRef?: React.MutableRefObject<ModalRef | undefined>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: ({ item }: ListRenderItemInfo<AccountJson>) => JSX.Element;
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
}: Props) => {
  const _onSelectItem = (item: AccountJson) => {
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
      isShowInput={isShowInput}>
      {children}
    </FullSizeSelectModal>
  );
};
