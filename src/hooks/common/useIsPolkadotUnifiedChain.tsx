import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

const useIsPolkadotUnifiedChain = () => {
  const chainOldPrefixMap = useSelector((state: RootState) => state.chainStore.chainOldPrefixMap);
  return useCallback(
    (chainSlug?: string): boolean => {
      if (!chainSlug) {
        return false;
      }

      return Object.prototype.hasOwnProperty.call(chainOldPrefixMap, chainSlug);
    },
    [chainOldPrefixMap],
  );
};

export default useIsPolkadotUnifiedChain;
