import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { NftCollectionType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import reformatAddress from 'utils/index';
import { ALL_ACCOUNT_KEY } from '@subwallet/extension-koni-base/constants';

export default function useFetchNftCollection(): NftCollectionType {
  const nftCollectionList = useSelector((state: RootState) => state.nftCollection.nftCollectionList);
  const nftList = useSelector((state: RootState) => state.nft.nftList);
  const networkMap = useSelector((state: RootState) => state.networkMap.details);
  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const networkList = Object.keys(networkMap);

  return useMemo((): NftCollectionType => {
    const nftCollections: NftCollection[] = [];
    const countMap: Record<string, number> = {};

    for (const nft of nftList) {
      const owner = nft.owner ? reformatAddress(nft.owner, 42, false) : '';
      if (currentAccountAddress === ALL_ACCOUNT_KEY || currentAccountAddress === owner) {
        const key = `${nft.chain}-${nft.collectionId}`;
        if (countMap.hasOwnProperty(key)) {
          countMap[key] = countMap[key] + 1;
        } else {
          countMap[key] = 1;
        }
      }
    }

    for (const nftCollection of nftCollectionList) {
      if (!networkList.includes(nftCollection.chain || '')) {
        continue;
      }
      const collection: NftCollection = { ...nftCollection };
      const key = `${collection.chain}-${collection.collectionId}`;
      if (countMap[key] && countMap[key] > 0) {
        collection.itemCount = countMap[key];
        nftCollections.push(collection);
      }
    }

    return {
      nftCollections,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccountAddress, JSON.stringify(networkList), nftCollectionList, nftList]);
}
