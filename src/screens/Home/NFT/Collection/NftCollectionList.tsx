import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useFetchNftCollection from 'hooks/useFetchNftCollection';
import { ListRenderItemInfo, StyleProp, View } from 'react-native';
import React, { useCallback } from 'react';
import NftCollectionItem from 'screens/Home/NFT/Collection/NftCollectionItem';
import { EmptyList } from 'screens/Home/NFT/Shared/EmptyList';
import NftCollectionImportText from 'screens/Home/NFT/Shared/NftCollectionImportText';

interface Props {
  handlePress: (collection: NftCollection) => () => void;
}

const NftCollectionListStyle: StyleProp<any> = {
  height: '100%',
};

const renderEmpty = () => {
  return <EmptyList />;
};

const NftCollectionList = ({ handlePress }: Props) => {
  const { nftCollections } = useFetchNftCollection();

  const filteredCollection = useCallback((items: NftCollection[], searchString: string) => {
    return items.filter(collection => {
      return collection.collectionName && collection.collectionName.toLowerCase().includes(searchString.toLowerCase());
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NftCollection>) => {
      const key = `${item.collectionName}-${item.collectionId}`;
      const onPress = handlePress(item);

      return <NftCollectionItem key={key} nftCollection={item} onPress={onPress} />;
    },
    [handlePress],
  );

  return (
    <View style={NftCollectionListStyle}>
      <FlatListScreen
        title={'NFT Collections'}
        autoFocus={false}
        showLeftBtn={false}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmpty}
        filterFunction={filteredCollection}
        afterListItem={<NftCollectionImportText />}
        items={nftCollections}
      />
    </View>
  );
};

export default NftCollectionList;
