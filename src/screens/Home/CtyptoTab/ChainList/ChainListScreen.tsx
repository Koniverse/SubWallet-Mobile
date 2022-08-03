import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import { ChainsTab } from 'screens/Home/CtyptoTab/ChainList/ChainsTab';
import { TokensTab } from 'screens/Home/CtyptoTab/ChainList/TokensTab';
import BigN from 'bignumber.js';
import { BalanceInfo } from '../../../../types';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import { BalanceBlock } from 'screens/Home/CtyptoTab/shared/BalanceBlock';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { tokenDisplayNameMap, tokenNetworkKeyMap } from 'utils/index';
import { ScreenContainer } from 'components/ScreenContainer';
import { Header } from 'components/Header';
import { SubHeader } from 'components/SubHeader';
import { MagnifyingGlass } from 'phosphor-react-native';
import { ListRenderItemInfo } from 'react-native';
import { TokenChainBalance } from 'components/TokenChainBalance';

interface Props {
  onPressSearchButton?: () => void;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
  showedNetworks: string[];
  networkBalanceMap: Record<string, BalanceInfo>;
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  onPressTokenItem: (tokenSymbol: string, tokenDisplayName: string, info?: AccountInfoByNetwork) => void;
  totalBalanceValue: BigN;
  tokenGroupMap: Record<string, string[]>;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
}

const ViewStep = {
  GROUP_LIST: 1,
  GROUP_DETAIL: 2,
};

function getFilteredTokenGroupMap(
  showedNetworks: string[],
  tokenGroupMap: Record<string, string[]>,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  Object.keys(tokenGroupMap).forEach(tgKey => {
    const filteredGroupItems = tokenGroupMap[tgKey].filter(tbKey => {
      const [networkKey] = tbKey.split('|');

      return showedNetworks.includes(networkKey);
    });

    if (filteredGroupItems.length) {
      result[tgKey] = filteredGroupItems;
    }
  });

  return result;
}

function getGroupListItems(
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
): TokenBalanceItemType[] {
  const result: TokenBalanceItemType[] = [];
  const tokenGroupKeys = Object.keys(tokenGroupMap).sort();

  tokenGroupKeys.forEach(tgKey => {
    const [symbol, isTestnet] = tgKey.split('|');
    const newItem: TokenBalanceItemType = {
      id: tgKey,
      logoKey: tokenNetworkKeyMap[symbol] ? tokenNetworkKeyMap[symbol][0] || symbol : symbol,
      networkKey: 'default',
      balanceValue: new BigN(0),
      convertedBalanceValue: new BigN(0),
      networkDisplayName: isTestnet ? 'Testnet' : undefined,
      symbol,
      displayedSymbol: tokenDisplayNameMap[symbol] || symbol.toUpperCase(),
      isReady: true,
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
): TokenBalanceItemType[] {
  return tbKeys.map(tbKey => {
    if (tokenBalanceMap[tbKey]) {
      return tokenBalanceMap[tbKey];
    }

    const [networkKey, symbol] = tbKey.split('|');

    return {
      id: tbKey,
      logoKey: symbol,
      networkKey,
      balanceValue: new BigN(0),
      convertedBalanceValue: new BigN(0),
      symbol,
      displayedSymbol: symbol,
      isReady: false,
    } as TokenBalanceItemType;
  });
}

function getTokenBalanceItems(
  viewStep: number,
  currentTgKey: string,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
): TokenBalanceItemType[] {
  if (viewStep === ViewStep.GROUP_LIST) {
    return getGroupListItems(tokenGroupMap, tokenBalanceMap);
  }

  if (viewStep === ViewStep.GROUP_DETAIL) {
    if (currentTgKey && tokenGroupMap[currentTgKey]) {
      return getGroupDetailItems(tokenGroupMap[currentTgKey], tokenBalanceMap);
    }
  }

  return [];
}

function getSubHeaderTitle(tgKey: string) {
  const [symbol] = tgKey.split('|');
  return tokenDisplayNameMap[symbol] || symbol.toUpperCase();
}

export const ChainListScreen = ({
  onPressSearchButton,
  accountInfoByNetworkMap,
  navigation,
  showedNetworks,
  networkBalanceMap,
  onPressChainItem,
  onPressTokenItem,
  totalBalanceValue,
  tokenGroupMap,
  tokenBalanceMap,
}: Props) => {
  const [viewStep, setViewStep] = useState<number>(ViewStep.GROUP_LIST);
  const filteredTokenGroupMap = getFilteredTokenGroupMap(showedNetworks, tokenGroupMap);
  const [currentTgKey, setCurrentTgKey] = useState<string>('');
  const tokenBalanceItems = getTokenBalanceItems(viewStep, currentTgKey, filteredTokenGroupMap, tokenBalanceMap);
  const subHeaderTitle = getSubHeaderTitle(currentTgKey);

  const _onPressTokenItem = (item: TokenBalanceItemType, info?: AccountInfoByNetwork) => {
    if (viewStep === ViewStep.GROUP_LIST) {
      setCurrentTgKey(item.id);
      setViewStep(ViewStep.GROUP_DETAIL);
    } else if (viewStep === ViewStep.GROUP_DETAIL) {
      onPressTokenItem(item.symbol, item.displayedSymbol, info);
    }
  };

  const onPressBack = () => {
    setCurrentTgKey('');
    setViewStep(ViewStep.GROUP_LIST);
  };

  const renderTabBar = (props: Tabs.MaterialTabBarProps<any>) => (
    <Tabs.MaterialTabBar
      {...props}
      // scrollEnabled
      activeColor={ColorMap.light}
      inactiveColor={ColorMap.light}
      indicatorStyle={{ backgroundColor: ColorMap.light, marginHorizontal: 16 }}
      tabStyle={{ backgroundColor: ColorMap.dark2 }}
      style={{ backgroundColor: ColorMap.dark2 }}
      labelStyle={{ ...sharedStyles.mediumText, ...FontSemiBold }}
    />
  );

  const renderTokenTabItem = ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => {
    const info = accountInfoByNetworkMap[item.networkKey];

    return (
      <TokenChainBalance
        key={`${item.symbol}-${item.networkKey}`}
        onPress={() => _onPressTokenItem(item, info)}
        {...item}
      />
    );
  };

  return (
    <ScreenContainer>
      <>
        {viewStep === ViewStep.GROUP_LIST && (
          <Header navigation={navigation} onPressSearchButton={onPressSearchButton} />
        )}
        {viewStep === ViewStep.GROUP_DETAIL && (
          <SubHeader
            showRightBtn
            backgroundColor={ColorMap.dark2}
            rightIcon={MagnifyingGlass}
            onPressRightIcon={onPressSearchButton}
            onPressBack={onPressBack}
            title={subHeaderTitle}
          />
        )}
        <Tabs.Container
          lazy
          allowHeaderOverscroll={true}
          renderTabBar={renderTabBar}
          renderHeader={() => {
            return <BalanceBlock balanceValue={totalBalanceValue} />;
          }}>
          <Tabs.Tab name="token" label="Token">
            <TokensTab items={tokenBalanceItems} renderItem={renderTokenTabItem} />
          </Tabs.Tab>
          <Tabs.Tab name="chain" label="Chain">
            <ChainsTab
              onPressChainItem={onPressChainItem}
              networkKeys={showedNetworks}
              networkBalanceMap={networkBalanceMap}
              accountInfoByNetworkMap={accountInfoByNetworkMap}
            />
          </Tabs.Tab>
        </Tabs.Container>
      </>
    </ScreenContainer>
  );
};
