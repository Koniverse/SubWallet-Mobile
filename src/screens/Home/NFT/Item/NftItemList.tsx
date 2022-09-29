import { NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import React, { useCallback, useMemo } from 'react';
import { ListRenderItemInfo, StyleProp, View } from 'react-native';
import NftItem from './NftItem';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';
import { Aperture } from 'phosphor-react-native';
import { NFTCollectionProps, NFTNavigationProps } from 'screens/Home/NFT/NFTStackScreen';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';

const NftItemListStyle: StyleProp<any> = {
  flex: 1,
};

const renderEmpty = () => {
  return <EmptyList title={i18n.nftScreen.nftAppearHere} icon={Aperture} />;
};

const filteredNftItem = (items: _NftItem[], searchString: string) => {
  return items.filter(item => {
    const name = item.name ? item.name : `#${item.id}`;
    return name.toLowerCase().includes(searchString.toLowerCase());
  });
};

const NftItemList = ({
  route: {
    params: { collectionId },
  },
}: NFTCollectionProps) => {
  const nftCollectionList = useSelector((state: RootState) => state.nftCollection.nftCollectionList);
  const nftList = useSelector((state: RootState) => state.nft.nftList);
  const collection = useMemo(() => {
    return nftCollectionList.find(i => collectionId === `${i.collectionName}-${i.collectionId}`);
  }, [collectionId, nftCollectionList]);
  const nftItems = useMemo(() => {
    return nftList.filter(item => item.collectionId === (collection?.collectionId || '__'));
  }, [collection?.collectionId, nftList]);
  const navigation = useNavigation<NFTNavigationProps>();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<_NftItem>) => {
      const key = `${item.collectionId}-${item.id}`;
      const onPress = () => {
        navigation.navigate('NFT', { collectionId, nftId: key });
      };

      return <NftItem key={key} nftItem={item} collectionImage={collection?.image} onPress={onPress} />;
    },
    [collection?.image, collectionId, navigation],
  );

  return (
    <View style={NftItemListStyle}>
      <FlatListScreen
        autoFocus={false}
        title={collection?.collectionName || i18n.title.nftList}
        showLeftBtn={true}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmpty}
        filterFunction={filteredNftItem}
        items={nftItems}
        numberColumns={2}
        searchMarginBottom={16}
      />
    </View>
  );
};

export default NftItemList;
