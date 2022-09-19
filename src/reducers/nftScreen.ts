import { NftCollection, NftItem } from '@subwallet/extension-base/background/KoniTypes';
import i18n from 'utils/i18n/i18n';

export interface NftScreenState {
  title: string;
  screen: 'CollectionList' | 'Collection' | 'NFT';
  collection?: NftCollection;
  nft?: NftItem;
}

export enum NftScreenActionType {
  OPEN_NFT = 'OPEN_NFT',
  OPEN_COLLECTION = 'OPEN_COLLECTION',
  OPEN_COLLECTION_LIST = 'OPEN_COLLECTION_LIST',
  GO_BACK = 'GO_BACK',
}

export interface AbstractNftScreenActionParams {
  type: NftScreenActionType;
  payload: Partial<NftScreenState> | null;
}

export interface NftScreenOpenNFTAction extends AbstractNftScreenActionParams {
  type: NftScreenActionType.OPEN_NFT;
  payload: Required<Pick<NftScreenState, 'nft'>>;
}

export interface NftScreenOpenCollectionAction extends AbstractNftScreenActionParams {
  type: NftScreenActionType.OPEN_COLLECTION;
  payload: Required<Pick<NftScreenState, 'collection'>>;
}

export interface NftScreenOpenCollectionListAction extends AbstractNftScreenActionParams {
  type: NftScreenActionType.OPEN_COLLECTION_LIST;
  payload: null;
}

export interface NftScreenGoBackAction extends AbstractNftScreenActionParams {
  type: NftScreenActionType.GO_BACK;
  payload: null;
}

export type NftScreenActionParams =
  | NftScreenOpenCollectionListAction
  | NftScreenOpenNFTAction
  | NftScreenOpenCollectionAction
  | NftScreenGoBackAction;

export const NFT_INITIAL_STATE: NftScreenState = {
  screen: 'CollectionList',
  title: i18n.title.nftCollections,
};

export const nftReducer = (state: NftScreenState, { type, payload }: NftScreenActionParams): NftScreenState => {
  switch (type) {
    case NftScreenActionType.OPEN_NFT:
      return { ...state, screen: 'NFT', title: payload.nft.name || i18n.title.nftDetail, nft: payload.nft };
    case NftScreenActionType.OPEN_COLLECTION:
      return {
        ...state,
        screen: 'Collection',
        title: payload.collection.collectionName ? `${payload.collection.collectionName} (${payload.collection.itemCount})` : i18n.title.nftList,
        collection: payload.collection,
        nft: undefined,
      };
    case NftScreenActionType.OPEN_COLLECTION_LIST:
      return {
        ...state,
        screen: 'CollectionList',
        title: i18n.title.nftCollections,
        collection: undefined,
        nft: undefined,
      };
    case NftScreenActionType.GO_BACK:
      const collection = state.collection;
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
