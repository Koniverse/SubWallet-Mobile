import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import React, { useCallback, useEffect } from 'react';
import { ListRenderItemInfo } from 'react-native';
import NftCollectionItem from 'screens/Home/NFT/Collection/NftCollectionItem';
import i18n from 'utils/i18n/i18n';
import { Plus } from 'phosphor-react-native';
import useFetchNftCollection from 'hooks/screen/Home/Nft/useFetchNftCollection';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NFTNavigationProps, renderEmptyNFT } from 'screens/Home/NFT/NFTStackScreen';
import { setAdjustPan } from 'rn-android-keyboard-adjust';

const filteredCollection = (items: NftCollection[], searchString: string) => {
  return items.filter(collection => {
    return collection.collectionName && collection.collectionName.toLowerCase().includes(searchString.toLowerCase());
  });
};

const NftCollectionList = () => {
  const { nftCollections } = useFetchNftCollection();
  const navigation = useNavigation<NFTNavigationProps>();
  // const [isRefresh, refresh] = useRefresh();

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setAdjustPan();
    }
  }, [isFocused]);

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
    <>
      <FlatListScreen
        autoFocus={false}
        showLeftBtn={false}
        title={i18n.header.yourCollections}
        renderItem={renderItem}
        renderListEmptyComponent={renderEmptyNFT}
        searchFunction={filteredCollection}
        items={nftCollections}
        placeholder={i18n.placeholder.searchCollectionName}
        flatListStyle={{ flex: 1 }}
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
        androidKeyboardVerticalOffset={0}
        numberColumns={2}
        searchMarginBottom={16}
        isShowPlaceHolder={false}
        isShowMainHeader
        needGapWithStatusBar={false}
      />
    </>
  );
};

export default NftCollectionList;
