import { BasicTokenInfo } from '@subwallet/extension-base/background/KoniTypes';
import { _getChainNativeTokenBasicInfo } from '@subwallet/extension-base/services/chain-service/utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useGetNativeTokenBasicInfo(chainSlug: string): BasicTokenInfo {
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  return useMemo(() => {
    const chainInfo = chainInfoMap[chainSlug];

    return _getChainNativeTokenBasicInfo(chainInfo);
  }, [chainInfoMap, chainSlug]);
}
