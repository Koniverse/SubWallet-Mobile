import React, { useState } from 'react';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { PredefinedDApps } from 'types/browser';
import BrowserListByCategory from './BrowserListByCategory';
import { BrowserListByTabviewProps } from 'routes/index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { FakeSearchInput } from 'screens/Home/Browser/Shared/FakeSearchInput';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Animated, View } from 'react-native';
import { Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';

type RoutesType = {
  key: string;
  title: string;
};
type TabbarType = {
  focused: boolean;
};
const Tab = createMaterialTopTabNavigator();
const transparent = { backgroundColor: 'transparent' };
const screenOptions = () => ({
  tabBarStyle: { height: 28, ...transparent },
  tabBarItemStyle: {
    width: 'auto',
    paddingLeft: 0,
    paddingRight: 0,
  },
  tabBarIconStyle: { width: 'auto', marginLeft: -2, marginRight: -2, top: -12 },
  tabBarScrollEnabled: true,
  lazy: true,
  tabBarShowLabel: false,
  tabBarIndicatorStyle: transparent,
});
const tabbarIcon = (focused: boolean, item: RoutesType, theme: ThemeTypes) => {
  const wrapperStyle = {
    paddingHorizontal: 8,
    paddingLeft: item.title.toLocaleLowerCase() === 'all' ? 16 : undefined,
  };
  const spaceStyle = {
    height: 2,
    marginTop: theme.marginXXS,
    backgroundColor: focused ? theme.colorPrimary : 'transparent',
  };
  return (
    <View style={wrapperStyle}>
      <Typography.Text style={{ ...FontSemiBold, color: focused ? theme.colorTextLight1 : theme.colorTextLight4 }}>
        {item.title}
      </Typography.Text>
      <View style={spaceStyle} />
    </View>
  );
};
export const BrowserListByTabview = ({ route, navigation }: BrowserListByTabviewProps) => {
  const theme = useSubWalletTheme().swThemes;
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const [searchString] = useState<string>('');
  const categoryTabRoutes = dApps.categories()?.map(item => ({ key: item.id, title: item.name }));
  const allTabRoutes = [{ key: 'all', title: i18n.common.all }, ...categoryTabRoutes];
  const navigationType: Record<string, string> = {
    BOOKMARK: i18n.browser.favorite,
    RECOMMENDED: i18n.browser.recommended,
  };
  const title = navigationType[route.params.type];
  const av = new Animated.Value(0);
  av.addListener(() => {
    return;
  });

  const tabScreenOptions = (item: RoutesType) => {
    return {
      tabBarIcon: ({ focused }: TabbarType) => tabbarIcon(focused, item, theme),
    };
  };

  const screenListener = {
    focus: () => {
      Animated.timing(av, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    },
  };

  return (
    <ContainerWithSubHeader
      title={title}
      showLeftBtn
      onPressBack={() => {
        navigation.canGoBack() && navigation.goBack();
      }}>
      <>
        <FakeSearchInput style={{ margin: theme.margin }} onPress={() => navigation.navigate('BrowserSearch')} />

        <Tab.Navigator
          overScrollMode={'always'}
          initialRouteName="TabBrowserHome0"
          sceneContainerStyle={transparent}
          screenOptions={screenOptions}
          screenListeners={screenListener}
          style={transparent}>
          {allTabRoutes.map(item => {
            return (
              <Tab.Screen
                key={item.key}
                name={item.key}
                initialParams={{ searchString, navigationType: route.params.type }}
                component={BrowserListByCategory}
                options={tabScreenOptions(item)}
              />
            );
          })}
        </Tab.Navigator>
      </>
    </ContainerWithSubHeader>
  );
};
