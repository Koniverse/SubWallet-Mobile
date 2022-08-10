import React from 'react';
import { ListRenderItemInfo, RefreshControl } from 'react-native';
import { ChainBalance } from 'components/ChainBalance';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import * as Tabs from 'react-native-collapsible-tab-view';
import { ColorMap } from 'styles/color';
import { CollapsibleFlatListStyle } from 'styles/sharedStyles';
import { BN_ZERO, getTokenDisplayName } from 'utils/chainBalances';

interface Props {
  isShowZeroBalance?: boolean;
  networkKeys: string[];
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  networkBalanceMap: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  isRefresh: boolean;
  refresh: (tabId: string) => void;
  refreshTabId: string;
}

const alwaysShowedNetworkKeys = ['kusama', 'polkadot'];

function getEmptyBalanceInfo(nativeToken?: string) {
  return {
    symbol: nativeToken || 'UNIT',
    displayedSymbol: (nativeToken && getTokenDisplayName(nativeToken)) || 'UNIT',
    balanceValue: BN_ZERO,
    convertedBalanceValue: BN_ZERO,
    detailBalances: [],
    childrenBalances: [],
    isReady: false,
  };
}

export const ChainsTab = ({
  networkKeys,
  onPressChainItem,
  networkBalanceMap,
  accountInfoByNetworkMap,
  isRefresh,
  refresh,
  refreshTabId,
  isShowZeroBalance,
}: Props) => {
  const renderItem = ({ item: networkKey }: ListRenderItemInfo<string>) => {
    const info = accountInfoByNetworkMap[networkKey];
    const balanceInfo = networkBalanceMap[networkKey] || getEmptyBalanceInfo(info.nativeToken);

    if (!isShowZeroBalance && !alwaysShowedNetworkKeys.includes(networkKey) && balanceInfo.balanceValue.eq(BN_ZERO)) {
      return null;
    }

    return (
      <ChainBalance
        key={info.key}
        accountInfo={info}
        onPress={() => onPressChainItem(info, balanceInfo)}
        balanceInfo={balanceInfo}
      />
    );
  };

  return (
    <Tabs.FlatList
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={{ backgroundColor: ColorMap.dark1 }}
      style={{ ...CollapsibleFlatListStyle }}
      keyboardShouldPersistTaps={'handled'}
      data={networkKeys}
      renderItem={renderItem}
      refreshControl={
        <RefreshControl
          style={{ backgroundColor: ColorMap.dark2, opacity: refreshTabId === 'two' ? 1 : 0 }}
          tintColor={ColorMap.light}
          refreshing={isRefresh}
          onRefresh={() => refresh('two')}
        />
      }
    />
  );
};
