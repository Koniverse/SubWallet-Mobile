import React from 'react';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenSelectItem } from 'components/TokenSelectItem';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  onCloseModal?: () => void;
}

export function _TokenSelectItem<T>({ item, selectedValueMap, onSelectItem, onCloseModal }: Props<T>) {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { symbol, originChain, slug } = item as TokenItemType;
  return (
    <TokenSelectItem
      key={`${symbol}-${originChain}`}
      symbol={symbol}
      chain={`${chainInfoMap[originChain]?.name || ''}`}
      logoKey={symbol.toLowerCase()}
      subLogoKey={originChain}
      isSelected={!!selectedValueMap[slug]}
      onSelectNetwork={() => {
        onSelectItem && onSelectItem(item);
        onCloseModal && onCloseModal();
      }}
    />
  );
}
