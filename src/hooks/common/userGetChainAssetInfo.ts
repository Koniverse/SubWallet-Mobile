// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useGetChainAssetInfo(assetSlug?: string) {
  const assetRegistry = useSelector((state: RootState) => state.assetRegistry.assetRegistry);

  if (!assetSlug) {
    return;
  }

  return assetRegistry[assetSlug];
}
