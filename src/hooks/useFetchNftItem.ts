import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { NftItemType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchNftItem(collection: NftCollection): NftItemType {
  const { nft: nftReducer } = useSelector((state: RootState) => state);

  return useMemo((): NftItemType => {
    const nftItems: NftItem[] = [];
    for (const nft of nftReducer.nftList) {
      if (nft.chain === collection.chain && nft.collectionId === collection.collectionId) {
        nftItems.push(nft);
      }
    }

    return {
      nftItems: nftItems,
    };
  }, [collection, nftReducer.nftList]);
}
