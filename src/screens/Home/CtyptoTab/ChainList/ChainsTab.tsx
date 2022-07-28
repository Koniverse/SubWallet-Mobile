import React from 'react';
import { FlatList, ListRenderItemInfo } from 'react-native';
import { ChainBalance } from 'components/ChainBalance';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';

interface Props {
  networkKeys: string[];
  onPressChainItem: (info: AccountInfoByNetwork, balanceInfo: BalanceInfo) => void;
  networkBalanceMaps: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
}

export const ChainsTab = ({ networkKeys, onPressChainItem, networkBalanceMaps, accountInfoByNetworkMap }: Props) => {
  const renderItem = ({ item: networkKey }: ListRenderItemInfo<string>) => {
    const info = accountInfoByNetworkMap[networkKey];
    const balanceInfo = networkBalanceMaps[networkKey];
    if (!balanceInfo || !balanceInfo.isReady) {
      return <ChainBalanceSkeleton key={info.key} />;
    } else {
      return (
        <ChainBalance
          key={info.key}
          accountInfo={info}
          onPress={() => onPressChainItem(info, balanceInfo)}
          balanceInfo={balanceInfo}
        />
      );
    }
  };

  return (
    <FlatList
      style={{ paddingTop: 8 }}
      keyboardShouldPersistTaps={'handled'}
      data={networkKeys}
      renderItem={renderItem}
    />
  );
};
