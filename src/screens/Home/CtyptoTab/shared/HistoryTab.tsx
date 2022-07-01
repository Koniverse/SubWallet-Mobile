import React from 'react';
import { Image, ScrollView, StyleProp, View } from 'react-native';
import { TokenHistoryItem } from 'components/TokenHistoryItem';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ChainRegistry, TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { Images } from 'assets/index';

interface Props {
  networkKey: string;
  token?: string;
}

interface ContentProps {
  registryMap: Record<string, ChainRegistry>;
  items: TransactionHistoryItemType[];
  token?: string;
}

const emptyListContainerStyle: StyleProp<any> = {
  alignItems: 'center',
  flex: 1,
  justifyContent: 'center',
};

function getReadyNetwork(registryMap: Record<string, ChainRegistry>): string[] {
  const result: string[] = [];

  for (const networkKey in registryMap) {
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

const EmptyList = () => {
  return (
    <View style={emptyListContainerStyle}>
      <Image source={Images.historyEmpty} />
    </View>
  );
};

const ContentComponent = ({ items, registryMap, token }: ContentProps) => {
  const renderItem = (item: TransactionHistoryItemType) => {
    const { networkKey } = item;
    const registry = registryMap[networkKey];

    if (
      (item.changeSymbol && !registry.tokenMap[item.changeSymbol]) ||
      (item.feeSymbol && !registry.tokenMap[item.feeSymbol])
    ) {
      return null;
    }

    if (token) {
      if (!registry.tokenMap[token]) {
        return null;
      }

      const isForMainToken = !item.changeSymbol && registry.tokenMap[token].isMainToken;
      const isForSubToken = item.changeSymbol && item.changeSymbol === token;

      if (!(isForMainToken || isForSubToken)) {
        return null;
      }
    }

    return <TokenHistoryItem item={item} key={item.extrinsicHash} registry={registry} />;
  };

  return <ScrollView>{items.map(renderItem)}</ScrollView>;
};

export const HistoryTab = ({ networkKey, token }: Props) => {
  const {
    chainRegistry: registryMap,
    transactionHistory: { historyMap },
  } = useSelector((state: RootState) => state);
  const readyNetworks = getReadyNetwork(registryMap);
  const items = getItems(networkKey, historyMap);
  const readyItems = items.filter(i => readyNetworks.includes(i.networkKey));

  if (!readyItems.length) {
    return <EmptyList />;
  }

  return <ContentComponent items={readyItems} registryMap={registryMap} token={token} />;
};
