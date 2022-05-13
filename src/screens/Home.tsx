import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NFTTab} from './Home/NFTTab';
import {CrowdloansTab} from './Home/CrowdloansTab';
import {StakingTab} from './Home/StakingTab';
import {TransfersTab} from './Home/TransfersTab';
import {CryptoTab} from './Home/CryptoTab';

// @ts-ignore
import CryptoLogo from '../assets/home-tab-icon/crypto.svg';
// @ts-ignore
import CryptoLogoFocused from '../assets/home-tab-icon/crypto-active.svg';
// @ts-ignore
import NFTLogo from '../assets/home-tab-icon/nfts.svg';
// @ts-ignore
import NFTLogoFocused from '../assets/home-tab-icon/nfts-active.svg';
// @ts-ignore
import CrowndloanLogo from '../assets/home-tab-icon/crowdloans.svg';
// @ts-ignore
import CrowndloanLogoFocused from '../assets/home-tab-icon/crowdloans-active.svg';
// @ts-ignore
import StakingLogo from '../assets/home-tab-icon/staking.svg';
// @ts-ignore
import StakingLogoFocused from '../assets/home-tab-icon/staking-active.svg';
// @ts-ignore
import TransferLogo from '../assets/home-tab-icon/transfers.svg';
// @ts-ignore
import TransferLogoFocused from '../assets/home-tab-icon/transfers-active.svg';

const logoMap = {
  crypto: CryptoLogo,
  crypto_focused: CryptoLogoFocused,
  nfts: NFTLogo,
  nfts_focused: NFTLogoFocused,
  crowdloan: CrowndloanLogo,
  crowdloan_focused: CrowndloanLogoFocused,
  staking: StakingLogo,
  staking_focused: StakingLogoFocused,
  transfer: TransferLogo,
  transfer_focused: TransferLogoFocused,
};

type HomeStackParamList = {
  Crypto: undefined;
  NFT: undefined;
  Crowdloans: undefined;
  Staking: undefined;
  Transfers: undefined;
};

export const Home = () => {
  const Tab = createBottomTabNavigator<HomeStackParamList>();

  const getHomeTabIcon = (iconName: string) => {
    // @ts-ignore
    return ({focused, size}) => {
      // @ts-ignore
      const IconComponent = logoMap[focused ? iconName + '_focused' : iconName];
      return <IconComponent width={size} />;
    };
  };
  return (
    <Tab.Navigator
      initialRouteName={'NFT'}
      screenOptions={{headerShown: false}}>
      <Tab.Screen
        name={'Crypto'}
        component={CryptoTab}
        options={{tabBarIcon: getHomeTabIcon('crypto'), tabBarActiveTintColor: '#42C59A'}}
      />
      <Tab.Screen
        name={'NFT'}
        component={NFTTab}
        options={{tabBarIcon: getHomeTabIcon('nfts'), tabBarActiveTintColor: '#42C59A'}}
      />
      <Tab.Screen
        name={'Crowdloans'}
        component={CrowdloansTab}
        options={{tabBarIcon: getHomeTabIcon('crowdloan'), tabBarActiveTintColor: '#42C59A'}}
      />
      <Tab.Screen
        name={'Staking'}
        component={StakingTab}
        options={{tabBarIcon: getHomeTabIcon('staking'), tabBarActiveTintColor: '#42C59A'}}
      />
      <Tab.Screen
        name={'Transfers'}
        component={TransfersTab}
        options={{tabBarIcon: getHomeTabIcon('transfer'), tabBarActiveTintColor: '#42C59A'}}
      />
    </Tab.Navigator>
  );
};
