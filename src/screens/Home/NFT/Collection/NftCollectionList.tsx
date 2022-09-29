import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import React, { useCallback } from 'react';
import { ListRenderItemInfo, StyleProp, View } from 'react-native';
import NftCollectionItem from 'screens/Home/NFT/Collection/NftCollectionItem';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import { Aperture, Plus } from 'phosphor-react-native';
import useFetchNftCollection from 'hooks/screen/Home/Nft/useFetchNftCollection';
import { useNavigation } from '@react-navigation/native';
import { NFTNavigationProps } from 'screens/Home/NFT/NFTStackScreen';
import { RootNavigationProps } from 'routes/index';

const NftCollectionListStyle: StyleProp<any> = {
  flex: 1,
};

const renderEmpty = () => {
  return <EmptyList title={i18n.nftScreen.nftAppearHere} icon={Aperture} />;
};

const filteredCollection = (items: NftCollection[], searchString: string) => {
  return items.filter(collection => {
    return collection.collectionName && collection.collectionName.toLowerCase().includes(searchString.toLowerCase());
  });
};

const NftCollectionList = () => {
  const { nftCollections } = useFetchNftCollection();
  const navigation = useNavigation<NFTNavigationProps>();
  const rootNavigation = useNavigation<RootNavigationProps>();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NftCollection>) => {
      const key = `${item.collectionName}-${item.collectionId}`;
      const onPress = () => {
        navigation.navigate('Collection', { collectionId: key });
      };

      return <NftCollectionItem key={key} nftCollection={item} onPress={onPress} />;
    },
    [navigation],
  );

  return (
    <View style={NftCollectionListStyle}>
      <FlatListScreen
        autoFocus={false}
        showLeftBtn={false}
        title={i18n.title.nftCollections}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmpty}
        filterFunction={filteredCollection}
        items={nftCollections}
        rightIconOption={{
          icon: Plus,
          onPress: () => {
            rootNavigation.navigate('ImportEvmNft');
          },
        }}
        numberColumns={2}
        searchMarginBottom={16}
      />
    </View>
  );
};

export default NftCollectionList;
