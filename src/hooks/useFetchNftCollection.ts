import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { NftCollectionType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchNftCollection(): NftCollectionType {
  const nftCollectionList = useSelector((state: RootState) => state.nftCollection.nftCollectionList);
  const nftList = useSelector((state: RootState) => state.nft.nftList);

  return useMemo((): NftCollectionType => {
    const nftCollections: NftCollection[] = [];
    for (const nftCollection of nftCollectionList) {
      const tmp: NftCollection = { ...nftCollection };
      let count = 0;
      for (const nft of nftList) {
        if (nft.chain === nftCollection.chain && nft.collectionId === nftCollection.collectionId) {
          count++;
        }
      }
      tmp.itemCount = count;
      nftCollections.push(tmp);
    }

    return {
      nftCollections,
    };
  }, [nftCollectionList, nftList]);
}
