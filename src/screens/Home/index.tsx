import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NFTTab } from './NFTTab';
import { CrowdloansTab } from './CrowdloansTab';
import { StakingTab } from './StakingTab';

import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { TouchableHighlight } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Aperture, CurrencyCircleDollar, Database, GlobeSimple, Rocket } from 'phosphor-react-native';
import { CryptoTab } from 'screens/Home/CtyptoTab';
import { RestoreJson } from 'screens/RestoreJson';

type HomeStackParamList = {
  Crypto: undefined;
  NFT: undefined;
  Crowdloans: undefined;
  Staking: undefined;
  Transfers: undefined;
  Restore: undefined;
};

export type HomeNavigationProps = NativeStackScreenProps<HomeStackParamList>['navigation'];
export type HomeRouteProps = NativeStackScreenProps<HomeStackParamList>['route'];

export const Home = () => {
  const Tab = createBottomTabNavigator<HomeStackParamList>();
  const swThemeColor = useSubWalletTheme().colors;

  return (
    <Tab.Navigator
      initialRouteName={'Crypto'}
      screenOptions={{
        headerShown: false,
        tabBarButton: props => {
          let customStyle = {};
          if (props.accessibilityState?.selected) {
            customStyle = {
              ...customStyle,
              // @ts-ignore
              borderTopWidth: 2,
              borderTopColor: swThemeColor.secondary,
              marginTop: -2,
            };
          }
          // @ts-ignore
          props.style = [[...props.style], customStyle];

          return <TouchableHighlight {...props} />;
        },
        tabBarIconStyle: {
          marginTop: 10,
        },
        tabBarLabelStyle: {
          paddingBottom: 32,
          fontSize: 12,
          lineHeight: 25,
          fontWeight: '600',
        },
        tabBarStyle: {
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: swThemeColor.background,
          borderTopWidth: 1,
          paddingLeft: 16,
          paddingRight: 16,
          height: 92,
        },
        tabBarActiveTintColor: swThemeColor.secondary,
        tabBarInactiveTintColor: swThemeColor.textColor,
      }}>
      <Tab.Screen
        name={'Crypto'}
        component={CryptoTab}
        options={{
          tabBarIcon: ({ color, size }) => {
            return <CurrencyCircleDollar size={size} color={color} weight={'bold'} />;
          },
        }}
      />
      <Tab.Screen
        name={'NFT'}
        component={NFTTab}
        options={{
          tabBarIcon: ({ color, size }) => {
            return <Aperture size={size} color={color} weight={'bold'} />;
          },
        }}
      />
      <Tab.Screen
        name={'Crowdloans'}
        component={CrowdloansTab}
        options={{
          tabBarIcon: ({ color, size }) => {
            return <Rocket size={size} color={color} weight={'bold'} />;
          },
        }}
      />
      <Tab.Screen
        name={'Staking'}
        component={StakingTab}
        options={{
          tabBarIcon: ({ color, size }) => {
            return <Database size={size} color={color} weight={'bold'} />;
          },
        }}
      />
      <Tab.Screen
        name={'Restore'}
        component={RestoreJson}
        options={{
          tabBarIcon: ({ color, size }) => {
            return <GlobeSimple size={size} color={color} weight={'bold'} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};
