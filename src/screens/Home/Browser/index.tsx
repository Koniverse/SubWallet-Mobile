import React, { useState } from 'react';
import { ScreenContainer } from 'components/ScreenContainer';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { PredefinedDApps } from 'types/browser';
import BrowserHome from './BrowserHome';
import BrowserHeader from './Shared/BrowserHeader';
import BrowserListByCategory from './BrowserListByCategory';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Animated, Dimensions, View } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { FakeSearchInput } from 'screens/Home/Browser/Shared/FakeSearchInput';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles';
import { FontSemiBold } from 'styles/sharedStyles';
import { Typography } from 'components/design-system-ui';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RoutesType = {
  key: string;
  title: string;
};
type TabbarType = {
  focused: boolean;
};
const Tab = createMaterialTopTabNavigator();
const initialLayout = {
  width: Dimensions.get('window').width,
};
const transparent = { backgroundColor: 'transparent' };
const screenOptions = (currentTabIndex: number) => ({
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
  swipeEnabled: !!currentTabIndex,
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
export const BrowserScreen = ({ navigation }: NativeStackScreenProps<{}>) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const [searchString] = useState<string>('');
  const categoryTabRoutes = dApps.categories().map(item => ({ key: item.id, title: item.name }));
  const allTabRoutes = [{ key: 'all', title: i18n.common.all }, ...categoryTabRoutes];
  const navigationState = useNavigationState(state => state);
  const currentTabIndex = navigationState.routes[navigationState.routes.length - 1].state?.index || 0;
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
    <ScreenContainer backgroundColor={theme.colorBgDefault}>
      <>
        <BrowserHeader />
        {/* @ts-ignore */}
        <FakeSearchInput style={stylesheet.fakeSearch} onPress={() => navigation.navigate('BrowserSearch')} />

        <Tab.Navigator
          initialLayout={initialLayout}
          sceneContainerStyle={transparent}
          initialRouteName="TabBrowserHome0"
          screenListeners={screenListener}
          screenOptions={screenOptions(currentTabIndex)}>
          {allTabRoutes.map((item, index) => {
            if (index === 0) {
              return (
                <Tab.Screen
                  key={'TabBrowserHome0'}
                  name="TabBrowserHome0"
                  component={BrowserHome}
                  options={tabScreenOptions(item)}
                />
              );
            }
            return (
              <Tab.Screen
                key={item.key}
                name={item.key}
                initialParams={{ searchString }}
                component={BrowserListByCategory}
                options={tabScreenOptions(item)}
              />
            );
          })}
        </Tab.Navigator>
      </>
    </ScreenContainer>
  );
};
