import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import React, { useCallback } from 'react';
import { ListRenderItemInfo } from 'react-native';
import NftCollectionItem from 'screens/Home/NFT/Collection/NftCollectionItem';
import i18n from 'utils/i18n/i18n';
import { Plus } from 'phosphor-react-native';
import useFetchNftCollection from 'hooks/screen/Home/Nft/useFetchNftCollection';
import { useNavigation } from '@react-navigation/native';
import { NFTNavigationProps, renderEmptyNFT } from 'screens/Home/NFT/NFTStackScreen';
import { Header } from 'components/Header';
import { ScreenContainer } from 'components/ScreenContainer';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

const filteredCollection = (items: NftCollection[], searchString: string) => {
  return items.filter(collection => {
    return collection.collectionName && collection.collectionName.toLowerCase().includes(searchString.toLowerCase());
  });
};

const NftCollectionList = () => {
  const theme = useSubWalletTheme().swThemes;
  const { nftCollections } = useFetchNftCollection();
  const navigation = useNavigation<NFTNavigationProps>();
  // const [isRefresh, refresh] = useRefresh();

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
    <ScreenContainer backgroundColor={theme.colorBgDefault}>
      <>
        <Header />
        <FlatListScreen
          style={{ marginTop: 16 }}
          autoFocus={false}
          showLeftBtn={false}
          title={i18n.title.nftCollections}
          renderItem={renderItem}
          renderListEmptyComponent={renderEmptyNFT}
          searchFunction={filteredCollection}
          items={nftCollections}
          rightIconOption={{
            icon: Plus,
            onPress: () => {
              navigation.navigate('ImportNft');
            },
          }}
          // refreshControl={
          //   <RefreshControl
          //     style={{ backgroundColor: ColorMap.dark1 }}
          //     tintColor={ColorMap.light}
          //     refreshing={isRefresh}
          //     onRefresh={() => refresh(restartCronServices(['nft']))}
          //   />
          // }
          numberColumns={2}
          searchMarginBottom={16}
          isShowPlaceHolder={false}
          needGapWithStatusBar={false}
        />
      </>
    </ScreenContainer>
  );
};

export default NftCollectionList;
