import React from 'react';
import { ScrollView } from 'react-native';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import BigN from 'bignumber.js';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';
import { getSelectedTokenList } from 'utils/index';

interface Props {
  networkBalanceMaps: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
  onPressTokenItem: (
    tokenName: string,
    tokenBalanceValue: BigN,
    tokenConvertedValue: BigN,
    tokenSymbol: string,
    info?: AccountInfoByNetwork,
    balanceInfo?: BalanceInfo,
  ) => void;
}

type TokenArrayType = {
  selectNetworkKey: string;
  tokenBalanceValue: BigN;
  convertedBalanceValue: BigN;
  tokenBalanceSymbol: string;
  defaultNetworkKey?: string;
};

export const TokensTab = ({ networkBalanceMaps, onPressTokenItem, accountInfoByNetworkMap }: Props) => {
  const tokenArray = getSelectedTokenList(networkBalanceMaps);

  const renderItem = (token: TokenArrayType, index: number) => {
    const info = accountInfoByNetworkMap[token.defaultNetworkKey || token.selectNetworkKey];
    const balanceInfo = networkBalanceMaps[token.defaultNetworkKey || token.selectNetworkKey];
    if (!balanceInfo) {
      return <ChainBalanceSkeleton key={info.key} />;
    } else {
      return (
        <TokenChainBalance
          key={`${token.selectNetworkKey}-${index}`}
          tokenBalanceValue={token.tokenBalanceValue}
          convertedBalanceValue={token.convertedBalanceValue}
          selectNetworkKey={token.selectNetworkKey}
          tokenBalanceSymbol={token.tokenBalanceSymbol}
          defaultNetworkKey={token.defaultNetworkKey}
          onPress={() =>
            onPressTokenItem(
              token.tokenBalanceSymbol,
              token.tokenBalanceValue,
              token.convertedBalanceValue,
              token.tokenBalanceSymbol,
              info,
              balanceInfo,
            )
          }
        />
      );
    }
  };

  return (
    <ScrollView style={{ paddingTop: 8 }}>
      {tokenArray && tokenArray.map((token, index) => renderItem(token, index))}
    </ScrollView>
  );
};
