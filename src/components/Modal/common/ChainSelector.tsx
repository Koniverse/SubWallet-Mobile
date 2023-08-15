import React from 'react';
import i18n from 'utils/i18n/i18n';
import { ChainInfo } from 'types/index';
import { FullSizeSelectModal } from 'components/common/SelectModal';
import { ModalRef } from 'types/modalRef';

interface Props {
  items: ChainInfo[];
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: ChainInfo) => void;
  renderSelected?: () => JSX.Element;
  disabled?: boolean;
  acceptDefaultValue?: boolean;
  chainSelectorRef: React.MutableRefObject<ModalRef | undefined>;
}

export const ChainSelector = ({
  items,
  selectedValueMap,
  onSelectItem,
  renderSelected,
  disabled,
  acceptDefaultValue,
  chainSelectorRef,
}: Props) => {
  return (
    <FullSizeSelectModal
      items={items}
      selectedValueMap={selectedValueMap}
      selectModalType={'single'}
      selectModalItemType={'chain'}
      onSelectItem={onSelectItem}
      renderSelected={renderSelected}
      disabled={disabled}
      acceptDefaultValue={acceptDefaultValue}
      placeholder={i18n.placeholder.searchNetwork}
      ref={chainSelectorRef}
      onBackButtonPress={() => chainSelectorRef?.current?.onCloseModal()}
      title={i18n.header.selectNetwork}
    />
  );
};
