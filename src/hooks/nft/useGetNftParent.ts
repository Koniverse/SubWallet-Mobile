// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { findNftDeep } from 'utils/nft';

export default function useGetNftParent(childItem?: NftItem): NftItem | undefined {
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);

  return useMemo(() => {
    const parentId = childItem?.parentId;

    if (!childItem || !parentId) {
      return undefined;
    }

    return findNftDeep(nftItems, parentId, childItem.chain, childItem.collectionId);
  }, [childItem, nftItems]);
}
