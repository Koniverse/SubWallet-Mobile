import { _getChainNativeTokenSlug } from '@subwallet/extension-base/services/chain-service/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ALL_KEY } from 'constants/index';

const useGetNativeTokenSlug = (chainSlug: string): string => {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  return useMemo(() => {
    if (chainSlug && chainSlug !== ALL_KEY) {
      const chainInfo = chainInfoMap[chainSlug];

      return _getChainNativeTokenSlug(chainInfo);
    }

    return '';
  }, [chainInfoMap, chainSlug]);
};

export default useGetNativeTokenSlug;
