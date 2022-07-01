import React from 'react';
import { ScrollView } from 'react-native';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { BN_ZERO } from 'utils/chainBalances';
import BigN from 'bignumber.js';
import { ChainBalanceSkeleton } from 'components/ChainBalanceSkeleton';

interface Props {
  selectedNetworkInfo: AccountInfoByNetwork;
  selectedBalanceInfo: BalanceInfo;
  onPressTokenItem: (
    tokenName: string,
    tokenBalanceValue: BigN,
    tokenConvertedValue: BigN,
    tokenSymbol: string,
  ) => void;
}

// todo: remove disabled, then handle onPress
export const TokensTab = ({ selectedNetworkInfo, selectedBalanceInfo, onPressTokenItem }: Props) => {
  const tokenBalanceValue = selectedBalanceInfo.balanceValue;
  const convertedBalanceValue = selectedBalanceInfo.convertedBalanceValue;
  return (
    <ScrollView>
      {!(selectedNetworkInfo && selectedBalanceInfo) ? (
        <ChainBalanceSkeleton />
      ) : (
        <TokenChainBalance
          tokenBalanceValue={tokenBalanceValue}
          convertedBalanceValue={convertedBalanceValue}
          selectNetworkKey={selectedNetworkInfo.networkKey}
          tokenBalanceSymbol={selectedBalanceInfo.symbol}
          onPress={() =>
            onPressTokenItem(
              selectedBalanceInfo.symbol,
              selectedBalanceInfo.balanceValue,
              selectedBalanceInfo.convertedBalanceValue,
              selectedBalanceInfo.symbol,
            )
          }
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
                tokenBalanceValue={children.balanceValue}
                convertedBalanceValue={children.convertedBalanceValue || BN_ZERO}
                selectNetworkKey={children.key}
                tokenBalanceSymbol={children.symbol}
                defaultNetworkKey={selectedNetworkInfo.networkKey}
                onPress={() =>
                  onPressTokenItem(
                    children.symbol,
                    children.balanceValue,
                    children.convertedBalanceValue,
                    children.symbol,
                  )
                }
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
