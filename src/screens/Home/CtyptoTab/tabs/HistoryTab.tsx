import React, { useEffect, useState } from 'react';
import { ListRenderItemInfo, RefreshControl, StyleProp, View } from 'react-native';
import Text from 'components/Text';
import { TokenHistoryItem } from 'components/TokenHistoryItem';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ChainRegistry, TransactionHistoryItemType } from '@subwallet/extension-base/background/KoniTypes';
import { ListDashes } from 'phosphor-react-native';
import { CollapsibleFlatListStyle, FontMedium, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import * as Tabs from 'react-native-collapsible-tab-view';

interface Props {
  networkKey: string;
  token?: string;
  isRefresh: boolean;
  refresh: (tabId: string) => void;
  refreshTabId: string;
}

interface ContentProps {
  registryMap: Record<string, ChainRegistry>;
  items: TransactionHistoryItemType[];
  isLoading: boolean;
  token?: string;
  isRefresh: boolean;
  refresh: (tabId: string) => void;
  refreshTabId: string;
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

const contentContainerStyle: StyleProp<any> = {
  position: 'relative',
  flex: 1,
};

const loadingLayerStyle: StyleProp<any> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10,
  backgroundColor: ColorMap.dark1,
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

const ContentComponent = ({ items, registryMap, isLoading, isRefresh, refresh, refreshTabId }: ContentProps) => {
  const renderItem = ({ item }: ListRenderItemInfo<TransactionHistoryItemType>) => {
    const { networkKey } = item;
    const registry = registryMap[networkKey];

    return <TokenHistoryItem item={item} key={item.extrinsicHash} registry={registry} />;
  };

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlatList
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={{ backgroundColor: ColorMap.dark1 }}
        style={{ ...CollapsibleFlatListStyle }}
        keyboardShouldPersistTaps={'handled'}
        data={items}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            style={{ backgroundColor: ColorMap.dark2, opacity: refreshTabId === 'two' ? 1 : 0 }}
            tintColor={ColorMap.light}
            refreshing={isRefresh}
            onRefresh={() => refresh('two')}
          />
        }
        ListEmptyComponent={<EmptyList />}
      />

      {isLoading && <View style={loadingLayerStyle} />}
    </View>
  );
};

export const HistoryTab = ({ networkKey, token, refreshTabId, isRefresh, refresh }: Props) => {
  const {
    chainRegistry: registryMap,
    transactionHistory: { historyMap },
  } = useSelector((state: RootState) => state);
  const readyNetworks = getReadyNetwork(registryMap);
  const items = getItems(networkKey, historyMap);
  const readyItems = getReadyItems(readyNetworks, items, registryMap, token);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isSync = true;

    setTimeout(() => {
      if (isSync) {
        setLoading(false);
      }
    }, 300);

    return () => {
      isSync = false;
    };
  }, []);

  return (
    <ContentComponent
      isLoading={isLoading}
      items={readyItems}
      registryMap={registryMap}
      isRefresh={isRefresh}
      refreshTabId={refreshTabId}
      refresh={refresh}
    />
  );
};
