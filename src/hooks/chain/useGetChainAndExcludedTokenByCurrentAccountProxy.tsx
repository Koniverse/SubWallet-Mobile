import { useMemo } from 'react';
import { RootState } from 'stores/index';
import { useSelector } from 'react-redux';
import useCreateGetChainAndExcludedTokenByAccountProxy from 'hooks/chain/useCreateGetChainAndExcludedTokenByAccountProxy';

interface ChainAndExcludedTokenInfo {
  allowedChains: string[];
  excludedTokens: string[];
}

const useGetChainAndExcludedTokenByCurrentAccountProxy = (): ChainAndExcludedTokenInfo => {
  const currentAccountProxy = useSelector((state: RootState) => state.accountState.currentAccountProxy);
  const getChainAndExcludedTokenByAccountProxy = useCreateGetChainAndExcludedTokenByAccountProxy();

  return useMemo<ChainAndExcludedTokenInfo>(() => {
    if (!currentAccountProxy) {
      return { allowedChains: [], excludedTokens: [] };
    }

    return getChainAndExcludedTokenByAccountProxy(currentAccountProxy);
  }, [currentAccountProxy, getChainAndExcludedTokenByAccountProxy]);
};

export default useGetChainAndExcludedTokenByCurrentAccountProxy;
