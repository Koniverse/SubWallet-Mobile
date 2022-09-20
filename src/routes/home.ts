import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NftScreenState } from 'reducers/nftScreen';

export interface NftScreenParams extends NftScreenState {
  refresh: boolean;
  time: number;
}

export type HomeStackParamList = {
  Crypto: undefined;
  NFT: undefined | NftScreenParams;
  Crowdloans: undefined;
  Staking: undefined;
  Browser: undefined;
};

interface AbstractHomeScreenParams {
  tab: keyof HomeStackParamList;
  params: HomeStackParamList[keyof HomeStackParamList];
}

interface HomeCryptoParams extends AbstractHomeScreenParams {
  tab: 'Crypto';
  params: undefined;
}

interface HomeNFTParams extends AbstractHomeScreenParams {
  tab: 'NFT';
  params: NftScreenParams | undefined;
}

interface HomeCrowdloansParams extends AbstractHomeScreenParams {
  tab: 'Crowdloans';
  params: undefined;
}

interface HomeStakingParams extends AbstractHomeScreenParams {
  tab: 'Staking';
  params: undefined;
}

interface HomeBrowserParams extends AbstractHomeScreenParams {
  tab: 'Browser';
  params: undefined;
}

export type HomeScreenParams =
  | HomeCryptoParams
  | HomeNFTParams
  | HomeCrowdloansParams
  | HomeStakingParams
  | HomeBrowserParams;

export type HomeNFTProps = NativeStackScreenProps<HomeStackParamList, 'NFT'>;

type NavigationProps = NativeStackScreenProps<HomeStackParamList>;
export type HomeNavigationProps = NavigationProps['navigation'];
