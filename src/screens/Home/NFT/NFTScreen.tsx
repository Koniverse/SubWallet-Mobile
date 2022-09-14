import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { EmptyList } from 'screens/Home/NFT/Shared/EmptyList';
import NftCollectionList from 'screens/Home/NFT/Collection/NftCollectionList';
import NftItemList from 'screens/Home/NFT/Item/NftItemList';
import { RootState } from 'stores/index';
import NftDetail from './Detail/NftDetail';

const NFTScreen = () => {
  const { accounts, networkMap, nftCollection } = useSelector((state: RootState) => state);

  const { currentAccountAddress, accounts: _accounts } = accounts;
  const showedNetworks = useShowedNetworks(currentAccountAddress, _accounts);

  const [selectedCollection, setSelectedCollection] = useState<NftCollection | null>(null);
  const [selectedNft, setSelectedNft] = useState<NftItem | null>(null);

  const handleSelectCollection = useCallback((collection: NftCollection) => {
    return () => {
      setSelectedCollection(collection);
    };
  }, []);

  const handleSelectItem = useCallback((item: NftItem) => {
    return () => {
      setSelectedNft(item);
    };
  }, []);

  const handleBackToSelectCollection = useCallback(() => {
    setSelectedCollection(null);
  }, []);

  const handleBackToSelectItem = useCallback(() => {
    setSelectedNft(null);
  }, []);

  useEffect(() => {
    setSelectedCollection(null);
    setSelectedNft(null);
  }, [showedNetworks, currentAccountAddress]);

  if (selectedNft && selectedCollection) {
    return (
      <NftDetail
        data={selectedNft}
        collectionId={selectedCollection.collectionId}
        collectionImage={selectedCollection.image}
        onBack={handleBackToSelectItem}
      />
    );
  }

  if (selectedCollection) {
    return (
      <NftItemList
        handlePress={handleSelectItem}
        nftCollection={selectedCollection}
        handleBack={handleBackToSelectCollection}
      />
    );
  }

  if (nftCollection.nftCollectionList.length) {
    return <NftCollectionList handlePress={handleSelectCollection} />;
  }

  return (
    <View>
      <EmptyList />
    </View>
  );
};

export default NFTScreen;
