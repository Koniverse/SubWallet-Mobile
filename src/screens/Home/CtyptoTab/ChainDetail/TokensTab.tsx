import React from 'react';
import { ScrollView } from 'react-native';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { BN_ZERO } from 'utils/chainBalances';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';

interface Props {
  selectedNetworkInfo: AccountInfoByNetwork;
  selectedBalanceInfo: BalanceInfo;
  onPressTokenItem: (tokenName: string, tokenSymbol: string) => void;
}

export const TokensTab = ({ selectedNetworkInfo, selectedBalanceInfo, onPressTokenItem }: Props) => {
  const tokenBalanceValue = selectedBalanceInfo.balanceValue;
  const convertedBalanceValue = selectedBalanceInfo.convertedBalanceValue;
  return (
    <ScrollView style={{ paddingTop: 8 }}>
      {!(selectedNetworkInfo && selectedBalanceInfo) ? (
        <ChainBalanceSkeleton />
      ) : (
        <TokenChainBalance
          networkDisplayName={selectedNetworkInfo.networkDisplayName}
          tokenBalanceValue={tokenBalanceValue}
          convertedBalanceValue={convertedBalanceValue}
          selectNetworkKey={selectedNetworkInfo.networkKey}
          tokenBalanceSymbol={selectedBalanceInfo.symbol}
          onPress={() => onPressTokenItem(selectedBalanceInfo.displayedSymbol, selectedBalanceInfo.symbol)}
        />
      )}

      {selectedBalanceInfo && selectedBalanceInfo.childrenBalances && selectedBalanceInfo.childrenBalances.length ? (
        selectedBalanceInfo.childrenBalances.map(children => {
          if (!(selectedNetworkInfo && selectedBalanceInfo)) {
            return <ChainBalanceSkeleton key={children.key} />;
          } else {
            return (
              <TokenChainBalance
                key={children.key}
                networkDisplayName={selectedNetworkInfo.networkDisplayName}
                tokenBalanceValue={children.balanceValue}
                convertedBalanceValue={children.convertedBalanceValue || BN_ZERO}
                selectNetworkKey={children.key}
                tokenBalanceSymbol={children.symbol}
                defaultNetworkKey={selectedNetworkInfo.networkKey}
                onPress={() => onPressTokenItem(children.displayedSymbol, children.symbol)}
              />
            );
          }
        })
      ) : (
        <></>
      )}
    </ScrollView>
  );
};
