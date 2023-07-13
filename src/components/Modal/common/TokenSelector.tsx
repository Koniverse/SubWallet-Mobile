import React from 'react';
import { ListRenderItemInfo } from 'react-native';
import i18n from 'utils/i18n/i18n';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';

export type TokenItemType = {
  name: string;
  slug: string;
  symbol: string;
  originChain: string;
};

interface Props {
  items: TokenItemType[];
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: TokenItemType) => void;
  disabled?: boolean;
  renderSelected?: () => JSX.Element;
  tokenSelectorRef?: React.MutableRefObject<ModalRef | undefined>;
  closeModalAfterSelect?: boolean;
  isShowContent?: boolean;
  isShowInput?: boolean;
  children?: React.ReactNode;
  renderCustomItem?: ({ item }: ListRenderItemInfo<TokenItemType>) => JSX.Element;
  defaultValue?: string;
  acceptDefaultValue?: boolean;
}

export const TokenSelector = ({
  items,
  selectedValueMap,
  onSelectItem,
  disabled,
  renderSelected,
  tokenSelectorRef,
  closeModalAfterSelect,
  isShowContent,
  isShowInput,
  children,
  renderCustomItem,
  defaultValue,
  acceptDefaultValue,
}: Props) => {
  return (
    <FullSizeSelectModal
      items={items}
      selectedValueMap={selectedValueMap}
      onBackButtonPress={() => tokenSelectorRef?.current?.onCloseModal()}
      selectModalType={'single'}
      selectModalItemType={'token'}
      title={i18n.header.selectToken}
      onSelectItem={onSelectItem}
      ref={tokenSelectorRef}
      renderSelected={renderSelected}
      placeholder={i18n.placeholder.searchToken}
      closeModalAfterSelect={closeModalAfterSelect}
      isShowContent={isShowContent}
      isShowInput={isShowInput}
      renderCustomItem={renderCustomItem}
      defaultValue={defaultValue}
      acceptDefaultValue={acceptDefaultValue}
      disabled={disabled}>
      {children}
    </FullSizeSelectModal>
  );
};
