import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import React, { useCallback, useEffect } from 'react';
import { ListRenderItemInfo, RefreshControl, SectionListData } from 'react-native';
import NftCollectionItem from 'screens/Home/NFT/Collection/NftCollectionItem';
import i18n from 'utils/i18n/i18n';
import { Plus } from 'phosphor-react-native';
import useFetchNftCollection from 'hooks/screen/Home/Nft/useFetchNftCollection';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NFTNavigationProps, renderEmptyNFT } from 'screens/Home/NFT/NFTStackScreen';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useRefresh } from 'hooks/useRefresh';
import { reloadCron } from 'messaging/index';

type GetItemLayoutType =
  | readonly NftCollection[]
  | SectionListData<NftCollection, SectionListData<NftCollection>>[]
  | null
  | undefined;
const filteredCollection = (items: NftCollection[], searchString: string) => {
  return items.filter(collection => {
    return collection.collectionName && collection.collectionName.toLowerCase().includes(searchString.toLowerCase());
  });
};
const ITEM_HEIGHT = 220;
const ITEM_SEPARATOR = 16;
const TOTAL_ITEM_HEIGHT = ITEM_HEIGHT + ITEM_SEPARATOR;

const NftCollectionList = () => {
  const theme = useSubWalletTheme().swThemes;
  const { nftCollections } = useFetchNftCollection();
  const navigation = useNavigation<NFTNavigationProps>();
  const [isRefresh, refresh] = useRefresh();

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

  const getItemLayout = (data: GetItemLayoutType, index: number) => ({
    index,
    length: TOTAL_ITEM_HEIGHT,
    offset: TOTAL_ITEM_HEIGHT * index,
  });

  return (
    <>
      <FlatListScreen
        autoFocus={false}
        showLeftBtn={false}
        title={i18n.header.yourCollections}
        titleTextAlign={'left'}
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
        refreshControl={
          <RefreshControl
            style={{ backgroundColor: theme.colorBgDefault }}
            tintColor={theme.colorWhite}
            refreshing={isRefresh}
            onRefresh={() => refresh(reloadCron({ data: 'nft' }))}
          />
        }
        androidKeyboardVerticalOffset={0}
        numberColumns={2}
        searchMarginBottom={16}
        isShowMainHeader
        getItemLayout={getItemLayout}
      />
    </>
  );
};

export default NftCollectionList;
