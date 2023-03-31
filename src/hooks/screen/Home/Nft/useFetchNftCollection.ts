import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { NftCollectionType } from 'hooks/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import reformatAddress from 'utils/index';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { findNetworkJsonByGenesisHash } from 'utils/getNetworkJsonByGenesisHash';

export default function useFetchNftCollection(): NftCollectionType {
  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);
  const chainInfoMap = useSelector((state: RootState) => state.chainStore.chainInfoMap);
  const currentAccount = useSelector((state: RootState) => state.accountState.currentAccount);

  const accountNetwork = useMemo(() => {
    const originGenesisHash = currentAccount?.originGenesisHash;

    if (originGenesisHash) {
      return findNetworkJsonByGenesisHash(chainInfoMap, originGenesisHash)?.slug;
    } else {
      return undefined;
    }
  }, [chainInfoMap, currentAccount]);

  return useMemo((): NftCollectionType => {
    const _nftCollections: NftCollection[] = [];
    const countMap: Record<string, number> = {};

    for (const nftItem of nftItems) {
      const owner = nftItem.owner ? reformatAddress(nftItem.owner, 42, false) : '';

      if (!currentAccount || isAccountAll(currentAccount.address) || currentAccount.address === owner) {
        const key = `${nftItem.chain}-${nftItem.collectionId}`;

        if (accountNetwork) {
          if (nftItem.chain !== accountNetwork) {
            continue;
          }
        }

        if (countMap.hasOwnProperty(key)) {
          countMap[key] = countMap[key] + 1;
        } else {
          countMap[key] = 1;
        }
      }
    }

    for (const nftCollection of nftCollections) {
      if (!nftCollection.chain || !chainInfoMap[nftCollection.chain]) {
        continue;
      }
      const collection: NftCollection = { ...nftCollection };
      const key = `${collection.chain}-${collection.collectionId}`;
      if (countMap[key] && countMap[key] > 0) {
        collection.itemCount = countMap[key];
        _nftCollections.unshift(collection);
      }
    }

    return {
      nftCollections: _nftCollections,
    };
  }, [currentAccount, chainInfoMap, nftCollections, nftItems, accountNetwork]);
}
