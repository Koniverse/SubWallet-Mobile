import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import NftCollectionList from 'screens/Home/NFT/Collection/NftCollectionList';
import NftItemList from 'screens/Home/NFT/Item/NftItemList';
import NftDetail from 'screens/Home/NFT/Detail/NftDetail';
import { RootStackParamList } from 'routes/index';
import { EmptyList } from 'components/EmptyList';
import { Image } from 'phosphor-react-native';
import withPageWrapper from 'components/pageWrapper';
import i18n from 'utils/i18n/i18n';

export type NFTStackParamList = {
  CollectionList: undefined;
  Collection: { collectionId: string };
  NftDetail: { collectionId: string; nftId: string };
};
export type NavigationProps = NativeStackScreenProps<NFTStackParamList & RootStackParamList>;
export type NFTNavigationProps = NavigationProps['navigation'];
export type NFTCollectionProps = NativeStackScreenProps<NFTStackParamList, 'Collection'>;
export type NFTDetailProps = NativeStackScreenProps<NFTStackParamList, 'NftDetail'>;

export const renderEmptyNFT = () => {
  return <EmptyList title={i18n.emptyScreen.nftEmptyTitle} icon={Image} message={i18n.emptyScreen.nftEmptyMessage} />;
};

const NFTStackScreen = () => {
  const NFTStack = createNativeStackNavigator<NFTStackParamList>();

  return (
    <NFTStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <NFTStack.Screen name="CollectionList" component={withPageWrapper(NftCollectionList, ['nft'])} />
      <NFTStack.Screen name="Collection" component={NftItemList} />
      <NFTStack.Screen name="NftDetail" component={NftDetail} />
    </NFTStack.Navigator>
  );
};

export default NFTStackScreen;
