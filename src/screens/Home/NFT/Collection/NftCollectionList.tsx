import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import React, { useCallback } from 'react';
import { ListRenderItemInfo, SafeAreaView, StyleProp, View } from 'react-native';
import NftCollectionItem from 'screens/Home/NFT/Collection/NftCollectionItem';
import { NftScreenActionParams, NftScreenActionType } from 'reducers/nftScreen';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import { Aperture } from 'phosphor-react-native';

interface Props {
  dispatchNftState: React.Dispatch<NftScreenActionParams>;
  nftCollections: NftCollection[];
}

const NftCollectionListStyle: StyleProp<any> = {
  height: '100%',
  paddingBottom: 16,
};

const renderEmpty = () => {
  return <EmptyList title={i18n.nftScreen.nftAppearHere} icon={Aperture} />;
};

const filteredCollection = (items: NftCollection[], searchString: string) => {
  return items.filter(collection => {
    return collection.collectionName && collection.collectionName.toLowerCase().includes(searchString.toLowerCase());
  });
};

const NftCollectionList = ({ dispatchNftState, nftCollections }: Props) => {
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<NftCollection>) => {
      const key = `${item.collectionName}-${item.collectionId}`;
      const onPress = () => {
        dispatchNftState({ type: NftScreenActionType.OPEN_COLLECTION, payload: { collection: item } });
      };

      return <NftCollectionItem key={key} nftCollection={item} onPress={onPress} />;
    },
    [dispatchNftState],
  );

  return (
    <View style={NftCollectionListStyle}>
      <FlatListScreen
        withSubHeader={false}
        autoFocus={false}
        showLeftBtn={false}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmpty}
        filterFunction={filteredCollection}
        items={nftCollections}
        numberColumns={2}
        searchMarginBottom={16}
      />
      <SafeAreaView />
    </View>
  );
};

export default NftCollectionList;
