import React from 'react';
import { ScrollView } from 'react-native';
import { TokenHistoryItem } from 'components/TokenHistoryItem';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ChainRegistry, TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';

interface Props {
  networkKey: string;
}

interface ContentProps {
  registryMap: Record<string, ChainRegistry>;
  items: TransactionHistoryItemType[];
}

function getReadyNetwork(registryMap: Record<string, ChainRegistry>): string[] {
  const result: string[] = [];

  for (const networkKey in registryMap) {
    // eslint-disable-next-line no-prototype-builtins
    if (!registryMap.hasOwnProperty(networkKey)) {
      continue;
    }

    if (registryMap[networkKey]) {
      result.push(networkKey);
    }
  }

  return result;
}

function getItems(
  networkKey: string,
  historyMap: Record<string, TransactionHistoryItemType[]>,
): TransactionHistoryItemType[] {
  const result: TransactionHistoryItemType[] = [];

  if (networkKey === 'all') {
    Object.values(historyMap).forEach(items => {
      result.push(...items);
    });
  } else {
    if (!historyMap[networkKey]) {
      return [];
    }

    result.push(...historyMap[networkKey]);
  }

  return result.sort((a, b) => b.time - a.time);
}

const ContentComponent = ({ items, registryMap }: ContentProps) => {
  const renderItem = (item: TransactionHistoryItemType) => {
    const { networkKey } = item;
    const registry = registryMap[networkKey];

    if (
      (item.changeSymbol && !registry.tokenMap[item.changeSymbol]) ||
      (item.feeSymbol && !registry.tokenMap[item.feeSymbol])
    ) {
      return null;
    }

    return <TokenHistoryItem item={item} key={item.extrinsicHash} registry={registry} />;
  };

  return <ScrollView>{items.map(renderItem)}</ScrollView>;
};

export const HistoryTab = ({ networkKey }: Props) => {
  const {
    chainRegistry: registryMap,
    transactionHistory: { historyMap },
  } = useSelector((state: RootState) => state);
  const readyNetworks = getReadyNetwork(registryMap);
  const items = getItems(networkKey, historyMap);
  const readyItems = items.filter(i => readyNetworks.includes(i.networkKey));

  //todo: add Empty List Component here
  if (!readyItems.length) {
    return <></>;
  }

  return <ContentComponent items={readyItems} registryMap={registryMap} />;
};
