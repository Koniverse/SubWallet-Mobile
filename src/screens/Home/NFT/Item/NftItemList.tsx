import { NftCollection, NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useFetchNftItem from 'hooks/useFetchNftItem';
import { ListRenderItemInfo, StyleProp, View } from 'react-native';
import React, { useCallback } from 'react';
import { EmptyList } from 'screens/Home/NFT/Shared/EmptyList';
import NftCollectionImportText from 'screens/Home/NFT/Shared/NftCollectionImportText';
import NftItem from './NftItem';

interface Props {
  handlePress: (item: _NftItem) => () => void;
  nftCollection: NftCollection;
  handleBack: () => void;
}

const NftItemListStyle: StyleProp<any> = {
  height: '100%',
};

const renderEmpty = () => {
  return <EmptyList />;
};

const filteredNftItem = (items: _NftItem[], searchString: string) => {
  return items.filter(item => {
    return item.name && item.name.toLowerCase().includes(searchString.toLowerCase());
  });
};

const NftItemList = ({ handleBack, handlePress, nftCollection }: Props) => {
  const nftItems = useFetchNftItem(nftCollection).nftItems;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<_NftItem>) => {
      const key = `${item.collectionId}-${item.id}`;
      const onPress = handlePress(item);

      return <NftItem key={key} nftItem={item} onPress={onPress} />;
    },
    [handlePress],
  );

  return (
    <View style={NftItemListStyle}>
      <FlatListScreen
        title={nftCollection.collectionName || 'NFT Items'}
        autoFocus={false}
        showLeftBtn={true}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmpty}
        filterFunction={filteredNftItem}
        afterListItem={<NftCollectionImportText />}
        items={nftItems}
        onPressBack={handleBack}
      />
    </View>
  );
};

export default NftItemList;
