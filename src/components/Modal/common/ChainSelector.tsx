import React from 'react';
import i18n from 'utils/i18n/i18n';
import { ChainInfo } from 'types/index';
import { FullSizeSelectModal } from 'components/common/SelectModal';

interface Props {
  items: ChainInfo[];
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: ChainInfo) => void;
  renderSelected?: () => JSX.Element;
  disabled?: boolean;
  chainSelectorRef: React.Ref<any>;
}

export const ChainSelector = ({
  items,
  selectedValueMap,
  onSelectItem,
  renderSelected,
  disabled,
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
      placeholder={i18n.placeholder.searchNetwork}
      ref={chainSelectorRef}
      title={i18n.header.selectNetwork}
    />
  );
};
