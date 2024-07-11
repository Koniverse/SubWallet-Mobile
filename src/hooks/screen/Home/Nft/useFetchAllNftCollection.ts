import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { NftCollectionType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchAllNftCollection(): NftCollectionType {
  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);

  return useMemo((): NftCollectionType => {
    const _nftCollections: NftCollection[] = [];
    const countMap: Record<string, number> = {};

    for (const nftItem of nftItems) {
      const key = `${nftItem.chain}-${nftItem.collectionId}`;

      if (countMap.hasOwnProperty(key)) {
        countMap[key] = countMap[key] + 1;
      } else {
        countMap[key] = 1;
      }
    }

    for (const nftCollection of nftCollections) {
      if (!nftCollection.chain || !chainInfoMap[nftCollection.chain]) {
        continue;
      }
      const collection: NftCollection = { ...nftCollection };
      if (!collection.image) {
        collection.image = nftItems.find(item => item.collectionId === collection.collectionId)?.image;
      }
      const key = `${collection.chain}-${collection.collectionId}`;
      if (countMap[key] && countMap[key] > 0) {
        collection.itemCount = countMap[key];
        _nftCollections.unshift(collection);
      }
    }

    return {
      nftCollections: _nftCollections,
    };
  }, [chainInfoMap, nftCollections, nftItems]);
}
