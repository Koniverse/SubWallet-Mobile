import { AccountProxy } from '@subwallet/extension-base/types';
import { useCallback } from 'react';
import useCoreCreateGetChainSlugsByAccountProxy from 'hooks/chain/useCoreCreateGetChainSlugsByAccountProxy';
import useGetExcludedTokens from 'hooks/assets/useGetExcludedTokens';

export interface ChainAndExcludedTokenInfo {
  allowedChains: string[];
  excludedTokens: string[];
}

const useCreateGetChainAndExcludedTokenByAccountProxy = () => {
  const getAllowedChainsByAccountProxy = useCoreCreateGetChainSlugsByAccountProxy();
  const getExcludedTokensByAccountProxy = useGetExcludedTokens();

  return useCallback(
    (accountProxy: AccountProxy): ChainAndExcludedTokenInfo => {
      const allowedChains = getAllowedChainsByAccountProxy(accountProxy);

      const excludedTokens = getExcludedTokensByAccountProxy(allowedChains, accountProxy);

      return { allowedChains, excludedTokens };
    },
    [getAllowedChainsByAccountProxy, getExcludedTokensByAccountProxy],
  );
};

export default useCreateGetChainAndExcludedTokenByAccountProxy;
