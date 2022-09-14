import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { NftCollectionType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchNftCollection(): NftCollectionType {
  const { nft: nftReducer, nftCollection: nftCollectionReducer } = useSelector((state: RootState) => state);

  return useMemo((): NftCollectionType => {
    const nftCollections: NftCollection[] = [];
    for (const nftCollection of nftCollectionReducer.nftCollectionList) {
      const tmp: NftCollection = { ...nftCollection };
      let count = 0;
      for (const nft of nftReducer.nftList) {
        if (nft.chain === nftCollection.chain && nft.collectionId === nftCollection.collectionId) {
          count++;
        }
      }
      tmp.itemCount = count;
      nftCollections.push(tmp);
    }

    return {
      nftCollections: nftCollections,
    };
  }, [nftCollectionReducer.nftCollectionList, nftReducer.nftList]);
}
