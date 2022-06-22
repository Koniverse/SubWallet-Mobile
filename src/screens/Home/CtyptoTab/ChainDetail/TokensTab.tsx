import React from 'react';
import { ScrollView } from 'react-native';
import { TokenChainBalance } from 'components/TokenChainBalance';
import { AccountInfoByNetwork } from 'types/ui-types';
import { BalanceInfo } from '../../../../types';
import { getTotalConvertedBalanceValue } from 'screens/Home/CtyptoTab/utils';
import { BN_ZERO } from 'utils/chainBalances';

interface Props {
  selectNetworkInfo: AccountInfoByNetwork;
  selectBalanceInfo: BalanceInfo;
}

export const TokensTab = ({ selectNetworkInfo, selectBalanceInfo }: Props) => {
  const tokenBalanceValue = selectBalanceInfo.balanceValue;
  const convertedBalanceValue = getTotalConvertedBalanceValue(selectBalanceInfo);
  return (
    <ScrollView>
      <TokenChainBalance
        isLoading={!selectNetworkInfo && selectBalanceInfo}
        tokenBalanceValue={tokenBalanceValue}
        convertedBalanceValue={convertedBalanceValue}
        selectNetworkKey={selectNetworkInfo.networkKey}
        tokenBalanceSymbol={selectBalanceInfo.symbol}
      />
      {selectBalanceInfo && selectBalanceInfo.childrenBalances && selectBalanceInfo.childrenBalances.length ? (
        selectBalanceInfo.childrenBalances.map(children => (
          <TokenChainBalance
            key={children.key}
            isLoading={!selectNetworkInfo && selectBalanceInfo}
            tokenBalanceValue={children.balanceValue}
            convertedBalanceValue={children.convertedBalanceValue || BN_ZERO}
            selectNetworkKey={children.key}
            tokenBalanceSymbol={children.symbol}
            defaultNetworkKey={selectNetworkInfo.networkKey}
          />
        ))
      ) : (
        <></>
      )}
    </ScrollView>
  );
};
