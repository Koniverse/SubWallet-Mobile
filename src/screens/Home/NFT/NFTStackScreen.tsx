import React, { useContext, useEffect } from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import NftCollectionList from 'screens/Home/NFT/Collection/NftCollectionList';
import NftItemList from 'screens/Home/NFT/Item/NftItemList';
import NftDetail from 'screens/Home/NFT/Detail/NftDetail';
import { RootStackParamList } from 'routes/index';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import { Aperture } from 'phosphor-react-native';
import { WebRunnerContext } from 'providers/contexts';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { startCronServices } from '../../../messaging';

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
  return <EmptyList title={i18n.nftScreen.nftAppearHere} icon={Aperture} />;
};

const NFTStackScreen = () => {
  const NFTStack = createNativeStackNavigator<NFTStackParamList>();
  const { clearBackgroundServiceTimeout } = useContext(WebRunnerContext);
  const isNftServiceActive = useSelector((state: RootState) => state.backgroundService.activeState.cron.nft);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused && !isNftServiceActive) {
      clearBackgroundServiceTimeout('nft');
      startCronServices(['nft']).catch(e => console.log('Start NFT service error:', e));
    }
  }, [clearBackgroundServiceTimeout, isFocused, isNftServiceActive]);

  return (
    <NFTStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <NFTStack.Screen name="CollectionList" component={NftCollectionList} />
      <NFTStack.Screen name="Collection" component={NftItemList} />
      <NFTStack.Screen name="NftDetail" component={NftDetail} />
    </NFTStack.Navigator>
  );
};

export default NFTStackScreen;
