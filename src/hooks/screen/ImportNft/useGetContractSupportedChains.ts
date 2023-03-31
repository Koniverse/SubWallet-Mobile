import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _isChainSupportEvmNft, _isChainSupportWasmNft } from '@subwallet/extension-base/services/chain-service/utils';
import { _ChainInfo } from '@subwallet/chain-list/types';
import { _ChainState } from '@subwallet/extension-base/services/chain-service/types';

function filterContractTypes(chainInfoMap: Record<string, _ChainInfo>, chainStateMap: Record<string, _ChainState>) {
  const filteredChainInfoMap: Record<string, _ChainInfo> = {};

  Object.values(chainInfoMap).forEach(chainInfo => {
    // todo: if mobile supports auto connect chain, then remove the condition below
    if (!chainStateMap[chainInfo.slug]?.active) {
      return;
    }

    if (_isChainSupportEvmNft(chainInfo) || _isChainSupportWasmNft(chainInfo)) {
      filteredChainInfoMap[chainInfo.slug] = chainInfo;
    }
  });

  return filteredChainInfoMap;
}

export default function useGetContractSupportedChains(): Record<string, _ChainInfo> {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const chainStateMap = useSelector((state: RootState) => state.chainStore.chainStateMap);

  return useMemo(() => {
    return filterContractTypes(chainInfoMap, chainStateMap);
  }, [chainInfoMap, chainStateMap]);
}
