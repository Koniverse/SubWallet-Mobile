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
import { BN_ZERO } from 'utils/chainBalances';

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
  tokenBalanceKeyPriceMap: Record<string, number>;
}

const ViewStep = {
  GROUP_LIST: 1,
  GROUP_DETAIL: 2,
};

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

function getTokenBalanceItems(
  viewStep: number,
  currentTgKey: string,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  if (viewStep === ViewStep.GROUP_LIST) {
    return getGroupListItems(tokenGroupMap, tokenBalanceMap, tokenBalanceKeyPriceMap);
  }

  if (viewStep === ViewStep.GROUP_DETAIL) {
    if (currentTgKey && tokenGroupMap[currentTgKey]) {
      return getGroupDetailItems(tokenGroupMap[currentTgKey], tokenBalanceMap, tokenBalanceKeyPriceMap);
    }
  }

  return [];
}

function getSubHeaderTitle(tgKey: string) {
  const [symbol] = tgKey.split('|');
  return tokenDisplayNameMap[symbol] || symbol.toUpperCase();
}

function getTotalBalanceValue(
  viewStep: number,
  currentTgKey: string,
  totalBalanceValue: BigN,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
): BigN {
  if (viewStep === ViewStep.GROUP_LIST) {
    return totalBalanceValue;
  }

  if (viewStep === ViewStep.GROUP_DETAIL) {
    if (currentTgKey && tokenGroupMap[currentTgKey]) {
      let result = new BigN(0);

      tokenGroupMap[currentTgKey].forEach(tbKey => {
        if (tokenBalanceMap[tbKey] && tokenBalanceMap[tbKey].isReady) {
          result = result.plus(tokenBalanceMap[tbKey].convertedBalanceValue);
        }
      });

      return result;
    }
  }

  return BN_ZERO;
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
  tokenBalanceKeyPriceMap,
}: Props) => {
  const [viewStep, setViewStep] = useState<number>(ViewStep.GROUP_LIST);
  const [currentTgKey, setCurrentTgKey] = useState<string>('');
  const tokenBalanceItems = getTokenBalanceItems(
    viewStep,
    currentTgKey,
    tokenGroupMap,
    tokenBalanceMap,
    tokenBalanceKeyPriceMap,
  );
  const subHeaderTitle = getSubHeaderTitle(currentTgKey);
  const _totalBalanceValue = getTotalBalanceValue(
    viewStep,
    currentTgKey,
    totalBalanceValue,
    tokenGroupMap,
    tokenBalanceMap,
  );

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
            return <BalanceBlock balanceValue={_totalBalanceValue} />;
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
