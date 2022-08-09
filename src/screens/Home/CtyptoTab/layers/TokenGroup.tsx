import { ScreenContainer } from 'components/ScreenContainer';
import React, { useState } from 'react';
import { Header } from 'components/Header';
import { SubHeader } from 'components/SubHeader';
import { ColorMap } from 'styles/color';
import { MagnifyingGlass } from 'phosphor-react-native';
import { tokenDisplayNameMap, tokenNetworkKeyMap } from 'utils/index';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'types/routes';
import * as Tabs from 'react-native-collapsible-tab-view';
import { renderTabBar } from 'screens/Home/CtyptoTab/layers/shared';
import { TokensTab } from 'screens/Home/CtyptoTab/tabs/TokensTab';
import { ChainsTab } from 'screens/Home/CtyptoTab/tabs/ChainsTab';
import { AccountInfoByNetwork, TokenBalanceItemType } from 'types/ui-types';
import BigN from 'bignumber.js';
import { BalanceInfo } from '../../../../types';
import { ListRenderItemInfo } from 'react-native';
import { TokenChainBalance } from 'components/TokenChainBalance';
import TabsContainerHeader from 'screens/Home/CtyptoTab/TabsContainerHeader';
import { BN_ZERO } from 'utils/chainBalances';

interface Prop {
  navigation: NativeStackNavigationProp<RootStackParamList>;
  onPressSearchButton: () => void;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  tokenGroupMap: Record<string, string[]>;
  tokenBalanceKeyPriceMap: Record<string, number>;
  tokenBalanceMap: Record<string, TokenBalanceItemType>;
  showedNetworks: string[];
  networkBalanceMap: Record<string, BalanceInfo>;
  handleChangeTokenItem: (tokenSymbol: string, tokenDisplayName: string, info?: AccountInfoByNetwork) => void;
  totalBalanceValue: BigN;
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

function getTokenBalanceItems(
  isGroupDetail: boolean,
  currentTgKey: string,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
  tokenBalanceKeyPriceMap: Record<string, number>,
): TokenBalanceItemType[] {
  if (!isGroupDetail) {
    return getGroupListItems(tokenGroupMap, tokenBalanceMap, tokenBalanceKeyPriceMap);
  }

  if (currentTgKey && tokenGroupMap[currentTgKey]) {
    return getGroupDetailItems(tokenGroupMap[currentTgKey], tokenBalanceMap, tokenBalanceKeyPriceMap);
  }

  return [];
}

function getTokenGroupDisplayName(tgKey: string) {
  const [symbol] = tgKey.split('|');
  return tokenDisplayNameMap[symbol] || symbol.toUpperCase();
}

function getBalanceValue(
  isGroupDetail: boolean,
  currentTgKey: string,
  totalBalanceValue: BigN,
  tokenGroupMap: Record<string, string[]>,
  tokenBalanceMap: Record<string, TokenBalanceItemType>,
): BigN {
  if (!isGroupDetail) {
    return totalBalanceValue;
  }

  if (currentTgKey && tokenGroupMap[currentTgKey]) {
    let result = new BigN(0);

    tokenGroupMap[currentTgKey].forEach(tbKey => {
      if (tokenBalanceMap[tbKey] && tokenBalanceMap[tbKey].isReady) {
        result = result.plus(tokenBalanceMap[tbKey].convertedBalanceValue);
      }
    });

    return result;
  }

  return BN_ZERO;
}

const TokenGroupLayer = ({
  navigation,
  onPressSearchButton,
  accountInfoByNetworkMap,
  onPressChainItem,
  tokenGroupMap,
  tokenBalanceKeyPriceMap,
  tokenBalanceMap,
  showedNetworks,
  networkBalanceMap,
  handleChangeTokenItem,
  totalBalanceValue,
}: Prop) => {
  const [currentTgKey, setCurrentTgKey] = useState<string>('');
  const [isGroupDetail, setGroupDetail] = useState<boolean>(false);
  const onPressBack = () => {
    setCurrentTgKey('');
    setGroupDetail(false);
  };
  const tokenBalanceItems = getTokenBalanceItems(
    isGroupDetail,
    currentTgKey,
    tokenGroupMap,
    tokenBalanceMap,
    tokenBalanceKeyPriceMap,
  );

  const onPressTokenItem = (item: TokenBalanceItemType, info?: AccountInfoByNetwork) => {
    if (isGroupDetail) {
      handleChangeTokenItem(item.symbol, item.displayedSymbol, info);
    } else {
      setCurrentTgKey(item.id);
      setGroupDetail(true);
    }
  };

  const renderTokenTabItem = ({ item }: ListRenderItemInfo<TokenBalanceItemType>) => {
    const info = accountInfoByNetworkMap[item.networkKey];

    return <TokenChainBalance key={item.id} onPress={() => onPressTokenItem(item, info)} {...item} />;
  };

  const renderTabContainerHeader = () => {
    return (
      <TabsContainerHeader
        balanceBlockProps={{
          balanceValue: getBalanceValue(isGroupDetail, currentTgKey, totalBalanceValue, tokenGroupMap, tokenBalanceMap),
        }}
      />
    );
  };

  return (
    <ScreenContainer>
      <>
        {!isGroupDetail && <Header navigation={navigation} onPressSearchButton={onPressSearchButton} />}
        {isGroupDetail && (
          <SubHeader
            showRightBtn
            backgroundColor={ColorMap.dark2}
            rightIcon={MagnifyingGlass}
            onPressRightIcon={onPressSearchButton}
            onPressBack={onPressBack}
            title={getTokenGroupDisplayName(currentTgKey)}
          />
        )}

        <Tabs.Container
          lazy
          allowHeaderOverscroll={true}
          renderTabBar={renderTabBar}
          renderHeader={renderTabContainerHeader}>
          <Tabs.Tab name={'one'} label={'Token'}>
            <TokensTab items={tokenBalanceItems} renderItem={renderTokenTabItem} />
          </Tabs.Tab>
          <Tabs.Tab name={'two'} label={'Chain'}>
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

export default TokenGroupLayer;
