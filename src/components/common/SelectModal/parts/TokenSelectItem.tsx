import React from 'react';
import { TokenSelectorItemType } from 'components/Modal/common/TokenSelector';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenSelectItem } from 'components/TokenSelectItem';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  onCloseModal?: () => void;
  showBalance?: boolean;
}

export function _TokenSelectItem<T>({
  item,
  selectedValueMap,
  onSelectItem,
  onCloseModal,
  showBalance = true,
}: Props<T>) {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { symbol, originChain, slug, name, balanceInfo } = item as TokenSelectorItemType;
  return (
    <TokenSelectItem
      key={`${symbol}-${originChain}`}
      name={name}
      symbol={symbol}
      chain={`${chainInfoMap[originChain]?.name || ''}`}
      logoKey={slug.toLowerCase()}
      subLogoKey={originChain}
      isSelected={!!selectedValueMap[slug]}
      balanceInfo={balanceInfo}
      showBalance={showBalance}
      onSelectNetwork={() => {
        onSelectItem && onSelectItem(item);
        onCloseModal && onCloseModal();
      }}
    />
  );
}
