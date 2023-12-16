import React from 'react';
import { TokenItemType } from 'components/Modal/common/TokenSelector';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { TokenSelectItem } from 'components/TokenSelectItem';
import { TokenBalanceItemType } from 'types/balance';

interface Props<T> {
  item: T;
  selectedValueMap: Record<string, boolean>;
  onSelectItem?: (item: T) => void;
  onCloseModal?: () => void;
  isShowBalance?: boolean;
  tokenBalance?: TokenBalanceItemType;
}

export function _TokenSelectItem<T>({
  item,
  selectedValueMap,
  onSelectItem,
  onCloseModal,
  isShowBalance,
  tokenBalance,
}: Props<T>) {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const { symbol, originChain, slug, name } = item as TokenItemType;

  return (
    <TokenSelectItem
      key={`${symbol}-${originChain}`}
      name={name}
      symbol={symbol}
      chain={`${chainInfoMap[originChain]?.name || ''}`}
      logoKey={slug.toLowerCase()}
      subLogoKey={originChain}
      isSelected={!!selectedValueMap[slug]}
      isShowBalance={isShowBalance}
      onSelectNetwork={() => {
        onSelectItem && onSelectItem(item);
        onCloseModal && onCloseModal();
      }}
      tokenBalance={tokenBalance}
    />
  );
}
