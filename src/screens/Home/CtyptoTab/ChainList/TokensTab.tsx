import React from 'react';
import { ScrollView } from 'react-native';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { BN_ZERO } from 'utils/chainBalances';
import BigN from 'bignumber.js';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';

interface Props {
  networkBalanceMaps: Record<string, BalanceInfo>;
  accountInfoByNetworkMap: Record<string, AccountInfoByNetwork>;
}

type TokenArrayType = {
  selectNetworkKey: string;
  tokenBalanceValue: BigN;
  convertedBalanceValue: BigN;
  tokenBalanceSymbol: string;
  defaultNetworkKey?: string;
};

export const TokensTab = ({ networkBalanceMaps }: Props) => {
  let tokenArray: TokenArrayType[] = [];

  Object.keys(networkBalanceMaps).forEach(networkKey => {
    const networkBalanceInfo = networkBalanceMaps[networkKey];
    tokenArray.push({
      selectNetworkKey: networkKey,
      tokenBalanceValue: networkBalanceInfo.balanceValue,
      convertedBalanceValue: networkBalanceInfo.convertedBalanceValue,
      tokenBalanceSymbol: networkBalanceInfo.symbol,
    });

    if (networkBalanceInfo.childrenBalances && networkBalanceInfo.childrenBalances.length) {
      networkBalanceInfo.childrenBalances.forEach(children =>
        tokenArray.push({
          selectNetworkKey: children.key,
          tokenBalanceValue: children.balanceValue,
          convertedBalanceValue: children.convertedBalanceValue || BN_ZERO,
          tokenBalanceSymbol: children.symbol,
          defaultNetworkKey: networkBalanceInfo.symbol,
        }),
      );
    }
  });

  return (
    <ScrollView style={{ paddingTop: 8 }}>
      {tokenArray &&
        tokenArray.map((token, index) => {
          if (!networkBalanceMaps) {
            return <ChainBalanceSkeleton key={`${token.selectNetworkKey}-${index}`} />;
          } else {
            return (
              <TokenChainBalance
                key={`${token.selectNetworkKey}-${index}`}
                tokenBalanceValue={token.tokenBalanceValue}
                convertedBalanceValue={token.convertedBalanceValue}
                selectNetworkKey={token.selectNetworkKey}
                tokenBalanceSymbol={token.tokenBalanceSymbol}
              />
            );
          }
        })}
    </ScrollView>
  );
};
