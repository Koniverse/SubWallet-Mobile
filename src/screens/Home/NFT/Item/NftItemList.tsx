import { NftItem as _NftItem } from '@subwallet/extension-base/background/KoniTypes';
import { FlatListScreen } from 'components/FlatListScreen';
import useGoHome from 'hooks/screen/useGoHome';
import useHandleGoHome from 'hooks/screen/useHandleGoHome';
import React, { useCallback, useMemo, useState } from 'react';
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
import { deleteCustomAssets, restartCronServices } from 'messaging/index';
import { useRefresh } from 'hooks/useRefresh';
import { Trash } from 'phosphor-react-native';
import DeleteModal from 'components/common/Modal/DeleteModal';
import useConfirmModal from 'hooks/modal/useConfirmModal';
import useGetChainAssetInfo from '@subwallet/extension-koni-ui/src/hooks/screen/common/useGetChainAssetInfo';
import { _isCustomAsset, _isSmartContractToken } from '@subwallet/extension-base/services/chain-service/utils';
import { useToast } from 'react-native-toast-notifications';

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
  const toast = useToast();

  const nftCollections = useSelector((state: RootState) => state.nft.nftCollections);
  const nftItems = useSelector((state: RootState) => state.nft.nftItems);
  const [isDeleting, setIsDeleting] = useState(false);

  const collection = useMemo(() => {
    return nftCollections.find(i => collectionId === `${i.collectionName}-${i.collectionId}`);
  }, [collectionId, nftCollections]);

  const originAssetInfo = useGetChainAssetInfo(collection?.originAsset);

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
        if (isDeleting) {
          return;
        }

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
    [collection?.image, collectionId, isDeleting, navigation],
  );

  const handeDelete = () => {
    if (collection?.originAsset) {
      setIsDeleting(true);
      deleteCustomAssets(collection.originAsset)
        .then(result => {
          if (result) {
            navigation.goBack();
            toast.show('Deleted NFT collection successfully');
          } else {
            toast.show('Deleted NFT collection unsuccessfully');
          }
          setIsDeleting(false);
        })
        .catch(() => {
          toast.show('Error. Please try again');
          setIsDeleting(false);
        });
    }
  };

  const {
    onPress: onPressDelete,
    onCancelModal: onCancelDelete,
    visible: deleteVisible,
    onCompleteModal: onCompleteDeleteModal,
  } = useConfirmModal(handeDelete);

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
        rightIconOption={{
          icon: Trash,
          disabled:
            isDeleting ||
            !(originAssetInfo && _isSmartContractToken(originAssetInfo) && _isCustomAsset(originAssetInfo.slug)),
          onPress: onPressDelete,
        }}
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

      {/*todo: i18n*/}
      <DeleteModal
        title={'Delete this NFT ?'}
        visible={deleteVisible}
        message={'If you need to use this NFT you would need to manually import it again'}
        onCompleteModal={onCompleteDeleteModal}
        onCancelModal={onCancelDelete}
      />
    </View>
  );
};

export default NftItemList;
