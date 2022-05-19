import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NFTTab } from './Home/NFTTab';
import { CrowdloansTab } from './Home/CrowdloansTab';
import { StakingTab } from './Home/StakingTab';
import { TransfersTab } from './Home/TransfersTab';
import { CryptoTab } from './Home/CryptoTab';

import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TouchableHighlight } from 'react-native';
import { HomeTabIcon } from '../assets';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type HomeStackParamList = {
  Crypto: undefined;
  NFT: undefined;
  Crowdloans: undefined;
  Staking: undefined;
  Transfers: undefined;
};

export type HomeNavigationProps = NativeStackScreenProps<HomeStackParamList>['navigation'];
export type HomeRouteProps = NativeStackScreenProps<HomeStackParamList>['route'];

export const Home = () => {
  const Tab = createBottomTabNavigator<HomeStackParamList>();
  const swThemeColor = useSubWalletTheme().colors;

  function getHomeTabIcon(
    iconName: string,
  ): (rs: { color: string; size: number; focused: boolean }) => React.ReactElement {
    return ({ color, size }) => {
      // @ts-ignore
      const IconComponent = HomeTabIcon[iconName];
      return <IconComponent width={size} color={color} />;
    };
  }

  return (
    <Tab.Navigator
      initialRouteName={'Crypto'}
      screenOptions={{
        headerShown: false,
        tabBarButton: props => {
          let customStyle = { marginLeft: 10, marginRight: 10 };
          if (props.accessibilityState?.selected) {
            customStyle = {
              ...customStyle,
              // @ts-ignore
              borderTopWidth: 2,
              borderTopColor: swThemeColor.primary,
              marginTop: -2,
            };
          }
          // @ts-ignore
          props.style = [[...props.style], customStyle];

          return <TouchableHighlight {...props} />;
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarLabelStyle: {
          paddingBottom: 8,
        },
        tabBarStyle: {
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: swThemeColor.background,
          borderTopWidth: 2,
          height: 64,
        },
      }}>
      <Tab.Screen
        name={'Crypto'}
        component={CryptoTab}
        options={{
          tabBarIcon: getHomeTabIcon('crypto'),
        }}
      />
      <Tab.Screen
        name={'NFT'}
        component={NFTTab}
        options={{
          tabBarIcon: getHomeTabIcon('nft'),
        }}
      />
      <Tab.Screen
        name={'Crowdloans'}
        component={CrowdloansTab}
        options={{
          tabBarIcon: getHomeTabIcon('crowdloan'),
        }}
      />
      <Tab.Screen
        name={'Staking'}
        component={StakingTab}
        options={{
          tabBarIcon: getHomeTabIcon('staking'),
        }}
      />
      <Tab.Screen
        name={'Transfers'}
        component={TransfersTab}
        options={{
          tabBarIcon: getHomeTabIcon('transfer'),
        }}
      />
    </Tab.Navigator>
  );
};
