import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';
import { StakingScreenStackParamList } from 'routes/staking/stakingScreen';
import { NFTStackParamList } from 'screens/Home/NFT/NFTStackScreen';

export type HomeStackParamList = {
  Crypto: undefined;
  NFT: NavigatorScreenParams<NFTStackParamList>;
  Crowdloans: undefined;
  Staking: NavigatorScreenParams<StakingScreenStackParamList> | undefined;
  Browser: undefined;
};

type NavigationProps = NativeStackScreenProps<HomeStackParamList>;
export type HomeNavigationProps = NavigationProps['navigation'];
