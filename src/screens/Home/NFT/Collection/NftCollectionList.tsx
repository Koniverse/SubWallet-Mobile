import { NftCollection } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import React, { useCallback, useEffect } from 'react';
import { RefreshControl, View } from 'react-native';
import NftCollectionItem from 'screens/Home/NFT/Collection/NftCollectionItem';
import i18n from 'utils/i18n/i18n';
import { Image, Plus } from 'phosphor-react-native';
import useFetchNftCollection from 'hooks/screen/Home/Nft/useFetchNftCollection';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NFTNavigationProps } from 'screens/Home/NFT/NFTStackScreen';
import { setAdjustPan } from 'rn-android-keyboard-adjust';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { useRefresh } from 'hooks/useRefresh';
import { reloadCron } from 'messaging/index';
import { EmptyList } from 'components/EmptyList';
import useGetBannerByScreen from 'hooks/campaign/useGetBannerByScreen';
import { BannerGenerator } from 'components/common/BannerGenerator';
import { ListRenderItemInfo } from '@shopify/flash-list';

const filteredCollection = (items: NftCollection[], searchString: string) => {
  return items.filter(collection => {
    return collection.collectionName && collection.collectionName.toLowerCase().includes(searchString.toLowerCase());
  });
};

const NftCollectionList = () => {
  const theme = useSubWalletTheme().swThemes;
  const { nftCollections } = useFetchNftCollection();
  const navigation = useNavigation<NFTNavigationProps>();
  const [isRefresh, refresh] = useRefresh();
  const { banners, onPressBanner, dismissBanner } = useGetBannerByScreen('nft');
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

  const renderEmptyNFT = () => {
    return (
      <EmptyList
        title={i18n.emptyScreen.nftEmptyTitle}
        icon={Image}
        message={i18n.emptyScreen.nftEmptyMessage}
        onPressReload={() => refresh(reloadCron({ data: 'nft' }))}
        isRefresh={isRefresh}
        addBtnLabel={i18n.buttonTitles.addNft}
        onPressAddBtn={() => navigation.navigate('ImportNft')}
      />
    );
  };

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
        estimatedItemSize={228.7}
        isHideBottomSafeArea={true}
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
        beforeListItem={
          banners && banners.length ? (
            <View
              style={{ paddingHorizontal: theme.padding, paddingTop: theme.paddingXS, paddingBottom: theme.marginXXS }}>
              <BannerGenerator banners={banners} onPressBanner={onPressBanner} dismissBanner={dismissBanner} />
            </View>
          ) : (
            <></>
          )
        }
      />
    </>
  );
};

export default NftCollectionList;
