import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import NftCollectionList from 'screens/Home/NFT/Collection/NftCollectionList';
import NftItemList from 'screens/Home/NFT/Item/NftItemList';
import NftDetail from 'screens/Home/NFT/Detail/NftDetail';
import NftBundleDetail from 'screens/Home/NFT/Detail/NftBundleDetail';
import NftViewStructure from 'screens/Home/NFT/Structure/NftViewStructure';
import { RootStackParamList } from 'routes/index';
import withPageWrapper from 'components/pageWrapper';

export type NFTStackParamList = {
  CollectionList: undefined;
  Collection: { chain: string; collectionId: string };
  NftDetail: { chain: string; collectionId: string; nftId: string };
  // `rootTokenId` identifies the top of the bundle tree; every nested token is looked up from it,
  // because navigation params must stay serializable and cannot carry the NftItem itself.
  NftBundleDetail: { chain: string; collectionId: string; nftId: string; rootTokenId: string };
  NftViewStructure: { chain: string; collectionId: string; rootTokenId: string; selectedNftId: string };
};
export type NavigationProps = NativeStackScreenProps<NFTStackParamList & RootStackParamList>;
export type NFTNavigationProps = NavigationProps['navigation'];
export type NFTCollectionProps = NativeStackScreenProps<NFTStackParamList, 'Collection'>;
export type NFTDetailProps = NativeStackScreenProps<NFTStackParamList, 'NftDetail'>;
export type NFTBundleDetailProps = NativeStackScreenProps<NFTStackParamList, 'NftBundleDetail'>;
export type NFTViewStructureProps = NativeStackScreenProps<NFTStackParamList, 'NftViewStructure'>;

const NFTStackScreen = () => {
  const NFTStack = createNativeStackNavigator<NFTStackParamList>();

  return (
    <NFTStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <NFTStack.Screen name="CollectionList" component={withPageWrapper(NftCollectionList, ['nft'])} />
      <NFTStack.Screen name="Collection" component={NftItemList} />
      <NFTStack.Screen name="NftDetail" component={NftDetail} />
      <NFTStack.Screen name="NftBundleDetail" component={NftBundleDetail} />
      <NFTStack.Screen name="NftViewStructure" component={NftViewStructure} />
    </NFTStack.Navigator>
  );
};

export default NFTStackScreen;
