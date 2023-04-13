import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ChainStakingMetadata } from '@subwallet/extension-base/background/KoniTypes';

export default function useGetChainStakingMetadata(chain?: string) {
  const chainStakingMetadataList = useSelector((state: RootState) => state.staking.chainStakingMetadataList);

  return useMemo(() => {
    if (!chain) {
      return;
    }

    let result: ChainStakingMetadata | undefined;

    for (const chainMetadata of chainStakingMetadataList) {
      if (chainMetadata.chain === chain) {
        result = chainMetadata;
      }
    }

    return result;
  }, [chain, chainStakingMetadataList]);
}
