// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NftItem } from '@subwallet/extension-base/background/KoniTypes';

/**
 * Nested (bundle) NFTs are stored as a tree: only the root token is kept in the flat
 * `nft.nftItems` list and every descendant hangs off its parent's `nestingTokens`.
 * Looking a child up therefore means walking the whole forest.
 */
export function findNftDeep(
  items: NftItem[],
  targetId: string,
  chain: string,
  collectionId: string,
): NftItem | undefined {
  for (const item of items) {
    if (item.id === targetId && item.chain === chain && item.collectionId === collectionId) {
      return item;
    }

    if (item.nestingTokens && item.nestingTokens.length > 0) {
      const foundChild = findNftDeep(item.nestingTokens, targetId, chain, collectionId);

      if (foundChild) {
        return foundChild;
      }
    }
  }

  return undefined;
}

export function countNftNodes(node: NftItem): number {
  let count = 1;

  node.nestingTokens?.forEach(child => {
    count += countNftNodes(child);
  });

  return count;
}
