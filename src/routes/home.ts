import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { StakingScreenStackParamList } from 'routes/staking/stakingScreen';
import { NFTStackParamList } from 'screens/Home/NFT/NFTStackScreen';
import { BrowserHomeProps, RootStackParamList } from 'routes/index';

export type CryptoStackParamList = {
  TokenGroups: undefined;
  TokenGroupsDetail: { slug: string };
};

export type CryptoNavigationProps = NativeStackScreenProps<CryptoStackParamList & RootStackParamList>['navigation'];
export type TokenGroupsDetailProps = NativeStackScreenProps<CryptoStackParamList, 'TokenGroupsDetail'>;

export type HomeStackParamList = {
  Tokens: NavigatorScreenParams<CryptoStackParamList>;
  NFTs: NavigatorScreenParams<NFTStackParamList>;
  Crowdloans: undefined;
  Staking: NavigatorScreenParams<StakingScreenStackParamList> | undefined;
  Browser: NavigatorScreenParams<BrowserHomeProps>;
};

type NavigationProps = NativeStackScreenProps<HomeStackParamList>;
export type HomeNavigationProps = NavigationProps['navigation'];
