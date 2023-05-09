import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import StakingScreen from './Staking/StakingScreen';

import { Platform, TouchableOpacity, View } from 'react-native';
import { Aperture, Database, Globe, Rocket, Wallet } from 'phosphor-react-native';
import { CryptoScreen } from 'screens/Home/Crypto';
import { FontMedium } from 'styles/sharedStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOTTOM_BAR_HEIGHT } from 'constants/index';
import { ColorMap } from 'styles/color';
import useCheckEmptyAccounts from 'hooks/useCheckEmptyAccounts';
import { FirstScreen } from 'screens/Home/FirstScreen';
import { CrowdloansScreen } from 'screens/Home/Crowdloans';
import { BrowserScreen } from 'screens/Home/Browser';
import { HomeStackParamList } from 'routes/home';
import NFTStackScreen from 'screens/Home/NFT/NFTStackScreen';
import withPageWrapper from 'components/pageWrapper';
import MigrateMasterPasswordConfirmModal from 'screens/MasterPassword/MigrateMasterPasswordConfirmModal';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { ActivityIndicator } from 'components/design-system-ui';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useAppLock from 'hooks/useAppLock';

const MainScreen = () => {
  const Tab = createBottomTabNavigator<HomeStackParamList>();
  const insets = useSafeAreaInsets();
  const theme = useSubWalletTheme().swThemes;

  return (
    <Tab.Navigator
      initialRouteName={'Tokens'}
      screenOptions={{
        headerShown: false,
        tabBarButton: props => {
          let customStyle = {
            flexDirection: 'column',
            // opacity: !props.accessibilityState?.selected ? 0.2 : 1,
          };
          if (props.accessibilityState?.selected) {
            customStyle = {
              ...customStyle,
              // @ts-ignore
              borderTopWidth: 2,
              borderTopColor: 'transparent',
              marginTop: -2,
            };
          }
          // @ts-ignore
          props.style = [[...props.style], customStyle];
          return <TouchableOpacity {...props} activeOpacity={1} />;
        },
        tabBarIconStyle: {
          marginTop: 10,
        },
        tabBarLabelStyle: {
          paddingTop: 2,
          paddingBottom: insets.bottom ? insets.bottom - 12 : 8,
          fontSize: 10,
          lineHeight: 18,
          ...FontMedium,
        },
        tabBarStyle: {
          paddingTop: 0,
          paddingBottom: 0,
          backgroundColor: theme.colorBgSecondary,
          borderTopWidth: 1,
          paddingLeft: 16,
          paddingRight: 16,
          borderTopColor: theme.colorBgBorder,
          height: BOTTOM_BAR_HEIGHT + (insets.bottom ? insets.bottom - 15 : insets.bottom),
        },
        tabBarActiveTintColor: ColorMap.light,
        tabBarInactiveTintColor: '#777777',
      }}>
      <Tab.Screen
        name={'Tokens'}
        component={CryptoScreen}
        options={{
          tabBarIcon: ({ color }) => {
            return <Wallet size={24} color={color} weight={'fill'} />;
          },
        }}
      />
      <Tab.Screen
        name={'NFTs'}
        component={NFTStackScreen}
        options={{
          tabBarHideOnKeyboard: Platform.OS === 'android',
          tabBarIcon: ({ color }) => {
            return <Aperture size={24} color={color} weight={'fill'} />;
          },
        }}
      />
      <Tab.Screen
        name={'Crowdloans'}
        component={withPageWrapper(CrowdloansScreen, ['crowdloan', 'price', 'chainStore'])}
        options={{
          tabBarHideOnKeyboard: Platform.OS === 'android',
          tabBarIcon: ({ color }) => {
            return <Rocket size={24} color={color} weight={'fill'} />;
          },
        }}
      />
      <Tab.Screen
        name={'Staking'}
        component={StakingScreen}
        options={{
          tabBarHideOnKeyboard: Platform.OS === 'android',
          tabBarIcon: ({ color }) => {
            return <Database size={24} color={color} weight={'fill'} />;
          },
        }}
      />
      <Tab.Screen
        name={'Browser'}
        component={BrowserScreen}
        options={{
          tabBarIcon: ({ color }) => {
            return <Globe size={24} color={color} weight={'fill'} />;
          },
        }}
      />
    </Tab.Navigator>
  );
};

export const Home = () => {
  const isEmptyAccounts = useCheckEmptyAccounts();
  const { hasMasterPassword, isReady } = useSelector((state: RootState) => state.accountState);
  const { isLocked } = useAppLock();
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    if (isReady && isLoading) {
      setTimeout(() => setLoading(false), 500);
    }
  }, [isReady, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator indicatorColor="white" size={30} />
      </View>
    );
  }

  return (
    <>
      {isEmptyAccounts ? <FirstScreen /> : <MainScreen />}
      <MigrateMasterPasswordConfirmModal visible={!hasMasterPassword && !isEmptyAccounts && !isLocked} />
    </>
  );
};
