import BigN from 'bignumber.js';
import useGetNetworkJson from 'hooks/screen/useGetNetworkJson';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getBalanceFormat } from 'screens/Sending/utils';
import { RootState } from 'stores/index';
import { BalanceFormatType } from 'types/ui-types';
import { BN_TEN } from 'utils/chainBalances';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import useTokenGroup from 'hooks/screen/useTokenGroup';
import useTokenBalanceKeyPriceMap from 'hooks/screen/useTokenBalanceKeyPriceMap';

export interface AmountInfo {
  balanceFormat: BalanceFormatType;
  reformatAmount: number;
  amountToUsd: number;
}

const useGetAmountInfo = (rawAmount: number | string, networkKey: string): AmountInfo => {
  const { currentAccountAddress, accounts } = useSelector((state: RootState) => state.accountState);
  const chainRegistry = useSelector((state: RootState) => state.chainRegistry.details);
  const network = useGetNetworkJson(networkKey);
  const showedNetworks = useShowedNetworks(currentAccountAddress, accounts);
  const tokenGroupMap = useTokenGroup(showedNetworks);
  const tokenBalanceKeyPriceMap = useTokenBalanceKeyPriceMap(tokenGroupMap);
  const isTestnet = network.groups.includes('TEST_NET');
  const selectedToken = useMemo((): string => network.nativeToken || 'Token', [network.nativeToken]);
  const balanceFormat = useMemo((): BalanceFormatType => {
    return getBalanceFormat(networkKey, selectedToken, chainRegistry);
  }, [chainRegistry, networkKey, selectedToken]);

  const tokenPrice = useMemo(
    () => tokenBalanceKeyPriceMap[`${networkKey}|${network.nativeToken}${isTestnet ? '|test' : ''}`] || 0,
    [isTestnet, network.nativeToken, networkKey, tokenBalanceKeyPriceMap],
  );

  const reformatAmount = useMemo(
    (): number => new BigN(rawAmount || '0').div(BN_TEN.pow(balanceFormat[0])).toNumber(),
    [balanceFormat, rawAmount],
  );

  const amountToUsd = useMemo(
    (): number => new BigN(reformatAmount).multipliedBy(new BigN(tokenPrice)).toNumber(),
    [reformatAmount, tokenPrice],
  );

  return useMemo(
    (): AmountInfo => ({
      reformatAmount: reformatAmount,
      amountToUsd: amountToUsd,
      balanceFormat: balanceFormat,
    }),
    [amountToUsd, balanceFormat, reformatAmount],
  );
};

export default useGetAmountInfo;
