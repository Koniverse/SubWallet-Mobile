import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { NFTStackParamList } from 'screens/Home/NFT/NFTStackScreen';

export interface NftScreenParams {
  refresh: boolean;
  time: number;
}

export type HomeStackParamList = {
  Crypto: undefined;
  NFT: NavigatorScreenParams<NFTStackParamList>;
  Crowdloans: undefined;
  Staking: undefined;
  Browser: undefined;
};

interface AbstractHomeScreenParams {
  tab: keyof HomeStackParamList;
  params?: HomeStackParamList[keyof HomeStackParamList];
}

interface HomeCryptoParams extends AbstractHomeScreenParams {
  tab: 'Crypto';
  params?: HomeStackParamList['Crypto'];
}

interface HomeNFTParams extends AbstractHomeScreenParams {
  tab: 'NFT';
  params?: HomeStackParamList['NFT'];
}

interface HomeCrowdloansParams extends AbstractHomeScreenParams {
  tab: 'Crowdloans';
  params?: HomeStackParamList['Crowdloans'];
}

interface HomeStakingParams extends AbstractHomeScreenParams {
  tab: 'Staking';
  params?: HomeStackParamList['Staking'];
}

interface HomeBrowserParams extends AbstractHomeScreenParams {
  tab: 'Browser';
  params?: HomeStackParamList['Browser'];
}

export type HomeScreenParams =
  | HomeCryptoParams
  | HomeNFTParams
  | HomeCrowdloansParams
  | HomeStakingParams
  | HomeBrowserParams;

type NavigationProps = NativeStackScreenProps<HomeStackParamList>;
export type HomeNavigationProps = NavigationProps['navigation'];
