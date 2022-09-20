import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { NftCollectionType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import reformatAddress from 'utils/index';

export default function useFetchNftCollection(): NftCollectionType {
  const nftCollectionList = useSelector((state: RootState) => state.nftCollection.nftCollectionList);
  const nftList = useSelector((state: RootState) => state.nft.nftList);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const networkList = Object.keys(networkMap);
  const accountList = accounts.map(account => account.address);

  return useMemo((): NftCollectionType => {
    const nftCollections: NftCollection[] = [];
    for (const nftCollection of nftCollectionList) {
      if (!networkList.includes(nftCollection.chain || '')) {
        continue;
      }
      const collection: NftCollection = { ...nftCollection };
      let count = 0;
      for (const nft of nftList) {
        const owner = nft.owner ? reformatAddress(nft.owner, 42, false) : '';
        if (
          nft.chain === nftCollection.chain &&
          nft.collectionId === nftCollection.collectionId &&
          accountList.includes(owner)
        ) {
          count++;
        }
      }
      if (count > 0) {
        collection.itemCount = count;
        nftCollections.push(collection);
      }
    }

    return {
      nftCollections,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(accountList), JSON.stringify(networkList), nftCollectionList, nftList]);
}
