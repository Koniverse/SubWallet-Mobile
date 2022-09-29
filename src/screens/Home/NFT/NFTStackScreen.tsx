import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import NftCollectionList from 'screens/Home/NFT/Collection/NftCollectionList';
import NftItemList from 'screens/Home/NFT/Item/NftItemList';
import NftDetail from 'screens/Home/NFT/Detail/NftDetail';
import { RootStackParamList } from 'routes/index';

export type NFTStackParamList = {
  CollectionList: undefined;
  Collection: { collectionId: string };
  NFT: { collectionId: string; nftId: string };
};
export type NavigationProps = NativeStackScreenProps<NFTStackParamList & RootStackParamList>;
export type NFTNavigationProps = NavigationProps['navigation'];
export type NFTCollectionProps = NativeStackScreenProps<NFTStackParamList, 'Collection'>;
export type NFTDetailProps = NativeStackScreenProps<NFTStackParamList, 'NFT'>;

const NFTStackScreen = () => {
  const NFTStack = createNativeStackNavigator<NFTStackParamList>();

  return (
    <NFTStack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <NFTStack.Screen name="CollectionList" component={NftCollectionList} />
      <NFTStack.Screen name="Collection" component={NftItemList} />
      <NFTStack.Screen name="NFT" component={NftDetail} />
    </NFTStack.Navigator>
  );
};

export default NFTStackScreen;
