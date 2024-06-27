import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchChainAssetInfo(key: string) {
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  return useMemo(() => assetRegistry[key], [assetRegistry, key]);
}
