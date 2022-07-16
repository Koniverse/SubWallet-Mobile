import React from 'react';
import { Image, ScrollView, StyleProp, Text, View } from 'react-native';
import { TokenHistoryItem } from 'components/TokenHistoryItem';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ChainRegistry, TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { Images } from 'assets/index';
import { ListDashes } from 'phosphor-react-native';
import { FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import i18n from "utils/i18n/i18n";

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
  paddingTop: 111,
  flex: 1,
  alignItems: 'center',
};

const emptyListTextStyle: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.light,
  ...FontMedium,
  paddingTop: 15,
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

function getReadyItems(
  readyNetworks: string[],
  items: TransactionHistoryItemType[],
  registryMap: Record<string, ChainRegistry>,
  token?: string,
): TransactionHistoryItemType[] {
  return items.filter(item => {
    if (!readyNetworks.includes(item.networkKey)) {
      return false;
    }

    const { networkKey } = item;
    const registry = registryMap[networkKey];

    if (
      (item.changeSymbol && !registry.tokenMap[item.changeSymbol]) ||
      (item.feeSymbol && !registry.tokenMap[item.feeSymbol])
    ) {
      return false;
    }

    if (token) {
      if (!registry.tokenMap[token]) {
        return false;
      }

      const isForMainToken = !item.changeSymbol && registry.tokenMap[token].isMainToken;
      const isForSubToken = item.changeSymbol && item.changeSymbol === token;

      if (!(isForMainToken || isForSubToken)) {
        return false;
      }
    }

    return true;
  });
}

const EmptyList = () => {
  return (
    <View style={emptyListContainerStyle}>
      {/*<Image source={Images.historyEmpty} />*/}
      <ListDashes size={80} color={'rgba(255, 255, 255, 0.3)'} weight={'thin'} />
      <Text style={emptyListTextStyle}>{i18n.common.emptyTransactionListMessage}</Text>
    </View>
  );
};

const ContentComponent = ({ items, registryMap }: ContentProps) => {
  const renderItem = (item: TransactionHistoryItemType) => {
    const { networkKey } = item;
    const registry = registryMap[networkKey];

    return <TokenHistoryItem item={item} key={item.extrinsicHash} registry={registry} />;
  };

  return <ScrollView style={{ paddingTop: 8 }}>{items.map(renderItem)}</ScrollView>;
};

export const HistoryTab = ({ networkKey, token }: Props) => {
  const {
    chainRegistry: registryMap,
    transactionHistory: { historyMap },
  } = useSelector((state: RootState) => state);
  const readyNetworks = getReadyNetwork(registryMap);
  const items = getItems(networkKey, historyMap);
  const readyItems = getReadyItems(readyNetworks, items, registryMap, token);

  if (!readyItems.length) {
    return <EmptyList />;
  }

  return <ContentComponent items={readyItems} registryMap={registryMap} />;
};
