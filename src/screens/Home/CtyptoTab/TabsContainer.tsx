import React from 'react';

import * as Tabs from 'react-native-collapsible-tab-view';
import { ListRenderItemInfo } from 'react-native';
import { ViewStep } from 'screens/Home/CtyptoTab/constant';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import BigN from 'bignumber.js';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { BalanceInfo } from '../../../types';
import TabsContainerHeader, { TabsContainerHeaderProps } from 'screens/Home/CtyptoTab/TabsContainerHeader';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { getTokenBalanceKey, tokenDisplayNameMap, tokenNetworkKeyMap } from 'utils/index';
import { TokensTab } from 'screens/Home/CtyptoTab/tabs/TokensTab';
import { ChainsTab } from 'screens/Home/CtyptoTab/tabs/ChainsTab';
import { BN_ZERO } from 'utils/chainBalances';
import { HistoryTab } from 'screens/Home/CtyptoTab/tabs/HistoryTab';

interface Props extends TabsContainerHeaderProps {
  showedNetworks: string[];
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  tokenBalanceKeyPriceMap: Record<string, number>;
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  onPressTokenBalanceItem: (item: TokenBalanceItemType, info?: AccountInfoByNetwork) => void;
}

interface TabsItemType {
  id: string;
  label: string;
  component: React.ReactElement;
}

function getGroupListItems(
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  const result: TokenBalanceItemType[] = [];
  const tokenGroupKeys = Object.keys(tokenGroupMap).sort();

  tokenGroupKeys.forEach(tgKey => {
    const [symbol, isTestnet] = tgKey.split('|');
    const newItem: TokenBalanceItemType = {
      priceValue: tokenBalanceKeyPriceMap[tgKey] || 0,
      id: tgKey,
      logoKey: tokenNetworkKeyMap[symbol] ? tokenNetworkKeyMap[symbol][0] || symbol : symbol,
      networkKey: 'default',
      balanceValue: new BigN(0),
      convertedBalanceValue: new BigN(0),
      networkDisplayName: isTestnet ? 'Testnet' : undefined,
      symbol,
      displayedSymbol: tokenDisplayNameMap[symbol] || symbol.toUpperCase(),
      isReady: true,
      isTestnet: !!isTestnet,
    };

    tokenGroupMap[tgKey].forEach(tbKey => {
      const tbItem = tokenBalanceMap[tbKey];
      if (tbItem && tbItem.isReady) {
        newItem.balanceValue = newItem.balanceValue.plus(tbItem.balanceValue);
        newItem.convertedBalanceValue = newItem.convertedBalanceValue.plus(tbItem.convertedBalanceValue);
      }
    });

    result.push(newItem);
  });

  return result;
}

function getGroupDetailItems(
  tbKeys: string[],
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  return tbKeys.map(tbKey => {
    if (tokenBalanceMap[tbKey]) {
      return tokenBalanceMap[tbKey];
    }

    const [networkKey, symbol, isTestnet] = tbKey.split('|');

    return {
      id: tbKey,
      logoKey: symbol,
      networkKey,
      balanceValue: new BigN(0),
      convertedBalanceValue: new BigN(0),
      symbol,
      displayedSymbol: symbol,
      isReady: false,
      isTestnet: !!isTestnet,
      priceValue: tokenBalanceKeyPriceMap[tbKey] || 0,
    };
  });
}

function getChainDetailItems(
  selectedNetworkInfo: AccountInfoByNetwork,
  selectedBalanceInfo: BalanceInfo,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  const items: TokenBalanceItemType[] = [];

  const symbol = selectedBalanceInfo?.symbol || 'Unit';
  const networkDisplayName = selectedNetworkInfo.networkDisplayName.replace(' Relay Chain', '');
  const isTestnet = selectedNetworkInfo.isTestnet;
  const itemId = getTokenBalanceKey(selectedNetworkInfo.networkKey, symbol, isTestnet);

  items.push({
    id: itemId,
    logoKey: selectedNetworkInfo.networkKey,
    networkKey: selectedNetworkInfo.networkKey,
    networkDisplayName,
    balanceValue: selectedBalanceInfo?.balanceValue || BN_ZERO,
    convertedBalanceValue: selectedBalanceInfo?.convertedBalanceValue || BN_ZERO,
    symbol,
    displayedSymbol: symbol,
    isReady: selectedNetworkInfo && selectedBalanceInfo && selectedBalanceInfo.isReady,
    isTestnet,
    priceValue: tokenBalanceKeyPriceMap[itemId] || 0,
  });

  if (selectedBalanceInfo && selectedBalanceInfo.childrenBalances && selectedBalanceInfo.childrenBalances.length) {
    selectedBalanceInfo.childrenBalances.forEach(item => {
      const cItemId = getTokenBalanceKey(selectedNetworkInfo.networkKey, item.symbol, isTestnet);
      items.push({
        id: cItemId,
        networkKey: selectedNetworkInfo.networkKey,
        networkDisplayName,
        logoKey: item.symbol,
        balanceValue: item.balanceValue,
        convertedBalanceValue: item.convertedBalanceValue,
        symbol: item.symbol,
        displayedSymbol: item.symbol,
        isReady: selectedNetworkInfo && selectedBalanceInfo && selectedBalanceInfo.isReady,
        isTestnet,
        priceValue: tokenBalanceKeyPriceMap[cItemId] || 0,
      });
    });
  }

  return items;
}

function getTokenBalanceItems(
  viewStep: string,
  currentTgKey: string,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  tokenBalanceKeyPriceMap: Record<string, number>,
  networkBalanceMap: Record<string, BalanceInfo>,
  selectedNetworkInfo?: AccountInfoByNetwork,
): TokenBalanceItemType[] {
  if (viewStep === ViewStep.TOKEN_GROUPS) {
    return getGroupListItems(tokenGroupMap, tokenBalanceMap, tokenBalanceKeyPriceMap);
  }

  if (viewStep === ViewStep.TOKEN_GROUP_DETAIL) {
    if (currentTgKey && tokenGroupMap[currentTgKey]) {
      return getGroupDetailItems(tokenGroupMap[currentTgKey], tokenBalanceMap, tokenBalanceKeyPriceMap);
    }
  }

  if (viewStep === ViewStep.CHAIN_DETAIL) {
    if (selectedNetworkInfo && networkBalanceMap[selectedNetworkInfo.networkKey]) {
      return getChainDetailItems(
        selectedNetworkInfo,
        networkBalanceMap[selectedNetworkInfo.networkKey],
        tokenBalanceKeyPriceMap,
      );
    }
  }

  return [];
}

const renderTabBar = (viewStep: string) => {
  if (viewStep === ViewStep.TOKEN_HISTORY) {
    return () => <></>;
  }

  return (props: Tabs.MaterialTabBarProps<any>) => (
    <Tabs.MaterialTabBar
      {...props}
      activeColor={ColorMap.light}
      inactiveColor={ColorMap.light}
      indicatorStyle={{ backgroundColor: ColorMap.light, marginHorizontal: 16 }}
      tabStyle={{ backgroundColor: ColorMap.dark2 }}
      style={{ backgroundColor: ColorMap.dark2 }}
      labelStyle={{ ...sharedStyles.mediumText, ...FontSemiBold }}
    />
  );
};

const TabsContainer = ({
  currentView,
  currentTgKey,
  totalBalanceValue,
  tokenGroupMap,
  tokenBalanceMap,
  networkBalanceMap,
  selectedNetworkInfo,
  selectedTokenSymbol,
  selectedTokenDisplayName,
  showedNetworks,
  accountInfoByNetworkMap,
  tokenBalanceKeyPriceMap,
  onPressChainItem,
  onPressTokenBalanceItem,
}: Props) => {
  const tokenBalanceItems = getTokenBalanceItems(
    currentView,
    currentTgKey,
    tokenGroupMap,
    tokenBalanceMap,
    tokenBalanceKeyPriceMap,
    networkBalanceMap,
    selectedNetworkInfo,
  );

  const renderTokenTabItem = ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => {
    const info = accountInfoByNetworkMap[item.networkKey];

    return <TokenChainBalance key={item.id} onPress={() => onPressTokenBalanceItem(item, info)} {...item} />;
  };

  const renderTabContainerHeader = () => {
    return (
      <TabsContainerHeader
        currentView={currentView}
        currentTgKey={currentTgKey}
        totalBalanceValue={totalBalanceValue}
        tokenGroupMap={tokenGroupMap}
        tokenBalanceMap={tokenBalanceMap}
        networkBalanceMap={networkBalanceMap}
        selectedNetworkInfo={selectedNetworkInfo}
        selectedTokenSymbol={selectedTokenSymbol}
        selectedTokenDisplayName={selectedTokenDisplayName}
      />
    );
  };

  const renderTabs = () => {
    const tabs: TabsItemType[] = [];

    if (currentView === ViewStep.TOKEN_GROUPS || currentView === ViewStep.TOKEN_GROUP_DETAIL) {
      tabs.push(
        ...[
          {
            id: 'token',
            label: 'Token',
            component: <TokensTab items={tokenBalanceItems} renderItem={renderTokenTabItem} />,
          },
          {
            id: 'chain',
            label: 'Chain',
            component: (
              <ChainsTab
                onPressChainItem={onPressChainItem}
                networkKeys={showedNetworks}
                networkBalanceMap={networkBalanceMap}
                accountInfoByNetworkMap={accountInfoByNetworkMap}
              />
            ),
          },
        ],
      );
    } else if (currentView === ViewStep.CHAIN_DETAIL) {
      tabs.push(
        ...[
          {
            id: 'token',
            label: 'Token',
            component: <TokensTab items={tokenBalanceItems} renderItem={renderTokenTabItem} />,
          },
          {
            id: 'history',
            label: 'History',
            component: selectedNetworkInfo ? <HistoryTab networkKey={selectedNetworkInfo.networkKey} /> : <></>,
          },
        ],
      );
    } else if (currentView === ViewStep.TOKEN_HISTORY) {
      tabs.push(
        ...[
          {
            id: 'history',
            label: 'History',
            component: selectedNetworkInfo ? (
              <HistoryTab networkKey={selectedNetworkInfo.networkKey} token={selectedTokenSymbol} />
            ) : (
              <></>
            ),
          },
        ],
      );
    }

    return tabs.map(tab => {
      return (
        <Tabs.Tab name={tab.id} label={tab.label} key={tab.id}>
          {tab.component}
        </Tabs.Tab>
      );
    });
  };

  return (
    <Tabs.Container
      lazy
      allowHeaderOverscroll={true}
      renderTabBar={renderTabBar(currentView)}
      renderHeader={renderTabContainerHeader}>
      {renderTabs()}
    </Tabs.Container>
  );
};

export default TabsContainer;
