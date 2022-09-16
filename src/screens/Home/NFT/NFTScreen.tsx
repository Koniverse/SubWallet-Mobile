import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import React, { useEffect, useReducer } from 'react';
import { StyleProp, View } from 'react-native';
import { useSelector } from 'react-redux';
import { EmptyList } from 'screens/Home/NFT/Shared/EmptyList';
import NftCollectionList from 'screens/Home/NFT/Collection/NftCollectionList';
import NftItemList from 'screens/Home/NFT/Item/NftItemList';
import { RootState } from 'stores/index';
import NftDetail from './Detail/NftDetail';
import { NftScreenActionParams, NftScreenState } from '../../../types';
import useFetchNftCollection from 'hooks/useFetchNftCollection';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import i18n from 'utils/i18n/i18n';

const NFT_INITIAL_STATE: NftScreenState = {
  screen: 'CollectionList',
  title: i18n.title.nftCollections,
};

const nftReducer = (state: NftScreenState, { type, payload }: NftScreenActionParams): NftScreenState => {
  const collection = payload.collection || state.collection;
  const nft = payload.nft || state.nft;
  switch (type) {
    case 'openNft':
      return { ...state, screen: 'NFT', title: nft?.name || i18n.title.nftDetail, nft: payload.nft };
    case 'openCollection':
      return {
        ...state,
        screen: 'Collection',
        title: collection?.collectionName || i18n.title.nftList,
        collection,
        nft: undefined,
      };
    case 'openCollectionList':
      return {
        ...state,
        screen: 'CollectionList',
        title: i18n.title.nftCollections,
        collection: undefined,
        nft: undefined,
      };
    case 'goBack':
      if (state.screen === 'NFT') {
        return {
          ...state,
          screen: 'Collection',
          title: collection?.collectionName || i18n.title.nftList,
          collection: collection,
          nft: undefined,
        };
      }
      return {
        ...state,
        screen: 'CollectionList',
        title: i18n.title.nftCollections,
        collection: undefined,
        nft: undefined,
      };
    default:
      throw new Error();
  }
};
const EMPTY_NFT = (
  <View>
    <EmptyList />
  </View>
);

const ContainerHeaderStyle: StyleProp<any> = {
  width: '100%',
};

const NFTScreen = () => {
  const [nftState, dispatchNftState] = useReducer(nftReducer, NFT_INITIAL_STATE);
  const { nftCollections } = useFetchNftCollection();
  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const showedNetworks = useShowedNetworks(currentAccountAddress, accounts);

  useEffect(() => {
    dispatchNftState({ type: 'openCollectionList', payload: {} });
  }, [showedNetworks, currentAccountAddress]);

  const goBack = () => {
    dispatchNftState({ type: 'goBack', payload: {} });
  };

  const NftContent = (): JSX.Element => {
    switch (nftState.screen) {
      case 'CollectionList':
        if (nftCollections.length > 0) {
          return <NftCollectionList nftCollections={nftCollections} dispatchNftState={dispatchNftState} />;
        } else {
          return EMPTY_NFT;
        }
      case 'Collection':
        if (nftState.collection) {
          return <NftItemList dispatchNftState={dispatchNftState} nftState={nftState} />;
        } else {
          dispatchNftState({ type: 'openCollectionList', payload: {} });
          return EMPTY_NFT;
        }

      case 'NFT':
        if (nftState.collection && nftState.nft) {
          return <NftDetail nftState={nftState} />;
        } else {
          dispatchNftState({ type: 'openCollectionList', payload: {} });
          return EMPTY_NFT;
        }

      default:
        dispatchNftState({ type: 'openCollectionList', payload: {} });
        return EMPTY_NFT;
    }
  };

  return (
    <ContainerWithSubHeader
      showLeftBtn={nftState.screen !== 'CollectionList'}
      onPressBack={goBack}
      title={nftState.title}
      style={ContainerHeaderStyle}
      isShowPlaceHolder={false}>
      <NftContent />
    </ContainerWithSubHeader>
  );
};

export default NFTScreen;
