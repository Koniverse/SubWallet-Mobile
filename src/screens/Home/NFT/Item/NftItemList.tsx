import { NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import React, { useCallback, useMemo } from 'react';
import { ListRenderItemInfo, RefreshControl, StyleProp, Text, View } from 'react-native';
import NftItem from './NftItem';
import i18n from 'utils/i18n/i18n';
import { NFTCollectionProps, NFTNavigationProps, renderEmptyNFT } from 'screens/Home/NFT/NFTStackScreen';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { restartCronServices } from '../../../../messaging';
import { useRefresh } from 'hooks/useRefresh';

const NftItemListStyle: StyleProp<any> = {
  flex: 1,
};

const NftItemsTextStyle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontBold,
  ...FontBold,
  color: ColorMap.light,
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
  const [isRefresh, refresh] = useRefresh();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<_NftItem>) => {
      const key = `${item.collectionId}-${item.id}`;
      const onPress = () => {
        navigation.navigate('NftDetail', { collectionId, nftId: key });
      };

      return <NftItem key={key} nftItem={item} collectionImage={collection?.image} onPress={onPress} />;
    },
    [collection?.image, collectionId, navigation],
  );

  return (
    <View style={NftItemListStyle}>
      <FlatListScreen
        headerContent={() => {
          return (
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'center' }}>
              <Text numberOfLines={1} style={[NftItemsTextStyle, { maxWidth: 200 }]}>
                {collection?.collectionName || i18n.title.nftList}
              </Text>
              <Text style={NftItemsTextStyle}>{` (${nftItems.length})`}</Text>
            </View>
          );
        }}
        autoFocus={false}
        showLeftBtn={true}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmptyNFT}
        filterFunction={filteredNftItem}
        items={nftItems}
        numberColumns={2}
        searchMarginBottom={16}
        refreshControl={
          <RefreshControl
            style={{ backgroundColor: ColorMap.dark2 }}
            tintColor={ColorMap.light}
            refreshing={isRefresh}
            onRefresh={() => refresh(restartCronServices(['nft']))}
          />
        }
      />
    </View>
  );
};

export default NftItemList;
