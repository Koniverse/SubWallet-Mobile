import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NFTScreen from 'screens/Home/NFT/NFTScreen';
import { StakingScreen } from './StakingScreen';

import { TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Aperture, CurrencyCircleDollar, Database, Rocket } from 'phosphor-react-native';
import { CryptoScreen } from 'screens/Home/Crypto';
import { FontMedium } from 'styles/sharedStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_BAR_HEIGHT } from '../../constant';
import { useToast } from 'react-native-toast-notifications';
import { ColorMap } from 'styles/color';
import i18n from 'utils/i18n/i18n';
import useCheckEmptyAccounts from 'hooks/useCheckEmptyAccounts';
import { FirstScreen } from 'screens/Home/FirstScreen';
import { CrowdloansScreen } from 'screens/Home/Crowdloans';

type HomeStackParamList = {
  Crypto: undefined;
  NFT: undefined;
  Crowdloans: undefined;
  Staking: undefined;
  Browser: undefined;
};

export type HomeNavigationProps = NativeStackScreenProps<HomeStackParamList>['navigation'];
export type HomeRouteProps = NativeStackScreenProps<HomeStackParamList>['route'];

function checkTabCompleted(target: string) {
  if (
    target === '/Home/Crypto' ||
    target === '/Home/Crowdloans' ||
    target === '/Home/Browser' ||
    target === '/Home/NFT'
  ) {
    return true;
  } else {
    return false;
  }
}

const MainScreen = () => {
  const Tab = createBottomTabNavigator<HomeStackParamList>();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const onPressComingSoonTab = useCallback(() => {
    toast.hideAll();
    toast.show(i18n.common.comingSoon);
  }, [toast]);

  return (
    <Tab.Navigator
      initialRouteName={'Crypto'}
      screenOptions={{
        headerShown: false,
        tabBarButton: props => {
          let customStyle = {
            // opacity: !props.accessibilityState?.selected ? 0.2 : 1,
          };
          if (props.accessibilityState?.selected) {
            customStyle = {
              ...customStyle,
              // @ts-ignore
              borderTopWidth: 2,
              borderTopColor: ColorMap.secondary,
              marginTop: -2,
            };
          }
          // @ts-ignore
          props.style = [[...props.style], customStyle];
          if (!checkTabCompleted(props.to || '')) {
            return <TouchableOpacity {...props} activeOpacity={1} onPress={() => onPressComingSoonTab()} />;
          } else {
            return <TouchableOpacity {...props} activeOpacity={1} />;
          }
        },
        tabBarIconStyle: {
          marginTop: 10,
        },
        tabBarLabelStyle: {
          paddingBottom: insets.bottom && insets.bottom - 12,
          fontSize: 10,
          lineHeight: 25,
          ...FontMedium,
        },
        tabBarStyle: {
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: ColorMap.dark1,
          borderTopWidth: 1,
          paddingLeft: 16,
          paddingRight: 16,
          height: BOTTOM_BAR_HEIGHT + (insets.bottom ? insets.bottom - 15 : insets.bottom),
        },
        tabBarActiveTintColor: ColorMap.secondary,
        tabBarInactiveTintColor: ColorMap.light,
      }}>
      <Tab.Screen
        name={'Crypto'}
        component={CryptoScreen}
        options={{
          tabBarIcon: ({ color }) => {
            return <CurrencyCircleDollar size={24} color={color} weight={'bold'} />;
          },
        }}
      />
      <Tab.Screen
        name={'NFT'}
        component={NFTScreen}
        options={{
          tabBarIcon: ({ color }) => {
            return <Aperture size={24} color={color} weight={'bold'} />;
          },
        }}
      />
      <Tab.Screen
        name={'Crowdloans'}
        component={CrowdloansScreen}
        options={{
          tabBarIcon: ({ color }) => {
            return <Rocket size={24} color={color} weight={'bold'} />;
          },
        }}
      />
      <Tab.Screen
        name={'Staking'}
        component={StakingScreen}
        options={{
          tabBarIcon: ({ color }) => {
            return <Database size={24} color={color} weight={'bold'} />;
          },
        }}
      />
      {/*<Tab.Screen*/}
      {/*  name={'Browser'}*/}
      {/*  component={BrowserScreen}*/}
      {/*  options={{*/}
      {/*    tabBarIcon: ({ color }) => {*/}
      {/*      return <GlobeSimple size={24} color={color} weight={'bold'} />;*/}
      {/*    },*/}
      {/*  }}*/}
      {/*/>*/}
    </Tab.Navigator>
  );
};

export const Home = () => {
  const isEmptyAccounts = useCheckEmptyAccounts();

  return <>{isEmptyAccounts ? <FirstScreen /> : <MainScreen />}</>;
};
