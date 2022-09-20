import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { NftCollectionType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchNftCollection(): NftCollectionType {
  const nftCollectionList = useSelector((state: RootState) => state.nftCollection.nftCollectionList);
  const nftList = useSelector((state: RootState) => state.nft.nftList);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);

  return useMemo((): NftCollectionType => {
    const networkList = Object.keys(networkMap);
    const nftCollections: NftCollection[] = [];
    for (const nftCollection of nftCollectionList) {
      if (!networkList.includes(nftCollection.chain || '')) {
        continue;
      }
      const tmp: NftCollection = { ...nftCollection };
      let count = 0;
      for (const nft of nftList) {
        if (nft.chain === nftCollection.chain && nft.collectionId === nftCollection.collectionId) {
          count++;
        }
      }
      if (count > 0) {
        tmp.itemCount = count;
        nftCollections.push(tmp);
      }
    }

    return {
      nftCollections,
    };
  }, [networkMap, nftCollectionList, nftList]);
}
