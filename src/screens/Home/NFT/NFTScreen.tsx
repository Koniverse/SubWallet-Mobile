import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import useShowedNetworks from 'hooks/screen/useShowedNetworks';
import useFetchNftCollection from 'hooks/useFetchNftCollection';
import React, { useEffect, useReducer } from 'react';
import { StyleProp } from 'react-native';
import { useSelector } from 'react-redux';
import { NFT_INITIAL_STATE, nftReducer, NftScreenActionType } from 'reducers/nftScreen';
import NftCollectionList from 'screens/Home/NFT/Collection/NftCollectionList';
import NftItemList from 'screens/Home/NFT/Item/NftItemList';
import { RootState } from 'stores/index';
import NftDetail from './Detail/NftDetail';
import { Aperture, Plus } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'types/routes';
import { EmptyList } from 'components/EmptyList';
import i18n from 'utils/i18n/i18n';

const EMPTY_NFT = <EmptyList title={i18n.nftScreen.nftAppearHere} icon={Aperture} />;

const ContainerHeaderStyle: StyleProp<any> = {
  width: '100%',
  position: 'relative',
};

const NFTScreen = () => {
  const [nftState, dispatchNftState] = useReducer(nftReducer, NFT_INITIAL_STATE);
  const { nftCollections } = useFetchNftCollection();
  const currentAccountAddress = useSelector((state: RootState) => state.accounts.currentAccountAddress);
  const accounts = useSelector((state: RootState) => state.accounts.accounts);
  const showedNetworks = useShowedNetworks(currentAccountAddress, accounts);
  const navigation = useNavigation<RootNavigationProps>();

  useEffect(() => {
    dispatchNftState({ type: NftScreenActionType.OPEN_COLLECTION_LIST, payload: null });
  }, [showedNetworks, currentAccountAddress]);

  const goBack = () => {
    dispatchNftState({ type: NftScreenActionType.GO_BACK, payload: null });
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
          dispatchNftState({ type: NftScreenActionType.OPEN_COLLECTION_LIST, payload: null });
          return EMPTY_NFT;
        }

      case 'NFT':
        if (nftState.collection && nftState.nft) {
          return <NftDetail nftState={nftState} />;
        } else {
          dispatchNftState({ type: NftScreenActionType.OPEN_COLLECTION_LIST, payload: null });
          return EMPTY_NFT;
        }

      default:
        dispatchNftState({ type: NftScreenActionType.OPEN_COLLECTION_LIST, payload: null });
        return EMPTY_NFT;
    }
  };

  return (
    <ContainerWithSubHeader
      showLeftBtn={nftState.screen !== 'CollectionList'}
      onPressBack={goBack}
      title={nftState.title}
      style={ContainerHeaderStyle}
      rightIcon={nftState.screen === 'CollectionList' ? Plus : undefined}
      onPressRightIcon={() => navigation.navigate('ImportEvmNft')}
      isShowPlaceHolder={false}>
      <NftContent />
    </ContainerWithSubHeader>
  );
};

export default NFTScreen;
