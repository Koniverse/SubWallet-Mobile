import { NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useGoHome from 'hooks/screen/useGoHome';
import useHandleGoHome from 'hooks/screen/useHandleGoHome';
import React, { useCallback, useMemo } from 'react';
import { ListRenderItemInfo, RefreshControl, StyleProp, Text, View } from 'react-native';
import { RootNavigationProps } from 'routes/index';
import NftItem from './NftItem';
import i18n from 'utils/i18n/i18n';
import { NFTCollectionProps, renderEmptyNFT } from 'screens/Home/NFT/NFTStackScreen';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { useNavigation } from '@react-navigation/native';
import { FontBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';
import { restartCronServices } from 'messaging/index';
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
  const navigation = useNavigation<RootNavigationProps>();

  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);

  const collection = useMemo(() => {
    return nftCollections.find(i => collectionId === `${i.collectionName}-${i.collectionId}`);
  }, [collectionId, nftCollections]);

  const _nftItems = useMemo(() => {
    return nftItems.filter(item => item.collectionId === (collection?.collectionId || '__'));
  }, [collection?.collectionId, nftItems]);
  const [isRefresh, refresh] = useRefresh();

  const goHome = useGoHome({ screen: 'NFTs', params: { screen: 'CollectionList' } });
  useHandleGoHome({ goHome: goHome, networkKey: collection?.chain || '', networkFocusRedirect: false });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<_NftItem>) => {
      const key = `${item.collectionId}-${item.id}`;
      const onPress = () => {
        navigation.navigate('Home', {
          screen: 'NFTs',
          params: {
            screen: 'NftDetail',
            params: { collectionId, nftId: key },
          },
        });
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
              <Text style={NftItemsTextStyle}>{` (${_nftItems.length})`}</Text>
            </View>
          );
        }}
        autoFocus={false}
        showLeftBtn={true}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmptyNFT}
        searchFunction={filteredNftItem}
        items={_nftItems}
        numberColumns={2}
        searchMarginBottom={16}
        refreshControl={
          <RefreshControl
            style={{ backgroundColor: ColorMap.dark1 }}
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
