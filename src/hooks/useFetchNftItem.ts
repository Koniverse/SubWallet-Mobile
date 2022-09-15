import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { NftItemType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';

export default function useFetchNftItem(collection: NftCollection): NftItemType {
  const nftList = useSelector((state: RootState) => state.nft.nftList);

  return useMemo((): NftItemType => {
    const nftItems: NftItem[] = [];
    for (const nft of nftList) {
      if (nft.chain === collection.chain && nft.collectionId === collection.collectionId) {
        nftItems.push(nft);
      }
    }

    return {
      nftItems: nftItems,
    };
  }, [collection, nftList]);
}
