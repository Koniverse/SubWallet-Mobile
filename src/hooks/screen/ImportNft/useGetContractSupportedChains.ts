import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { _isChainSupportEvmNft, _isChainSupportWasmNft } from '@subwallet/extension-base/services/chain-service/utils';
import { _ChainInfo } from '@subwallet/chain-list/types';
import useChainAssets from 'hooks/chain/useChainAssets';

function filterContractTypes(chainInfoMap: Record<string, _ChainInfo>) {
  const filteredChainInfoMap: Record<string, _ChainInfo> = {};

  Object.values(chainInfoMap).forEach(chainInfo => {
    if (_isChainSupportEvmNft(chainInfo) || _isChainSupportWasmNft(chainInfo)) {
      filteredChainInfoMap[chainInfo.slug] = chainInfo;
    }
  });

  return filteredChainInfoMap;
}

export default function useGetContractSupportedChains(): Record<string, _ChainInfo> {
  const availableChains = useChainAssets().availableChains;
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  return useMemo(() => {
    const filteredChainInfoMap: Record<string, _ChainInfo> = {};
    Object.values(chainInfoMap).forEach(chainInfo => {
      if (availableChains.includes(chainInfo.slug)) {
        filteredChainInfoMap[chainInfo.slug] = chainInfo;
      }
    });

    return filterContractTypes(filteredChainInfoMap);
  }, [chainInfoMap, availableChains]);
}
