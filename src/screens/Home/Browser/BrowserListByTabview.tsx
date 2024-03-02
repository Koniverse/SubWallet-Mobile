import React, { useMemo, useState } from 'react';
import BrowserListByCategory from './BrowserListByCategory';
import { BrowserListByTabviewProps } from 'routes/index';
import { MaterialTopTabNavigationOptions, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { FakeSearchInput } from 'screens/Home/Browser/Shared/FakeSearchInput';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Animated, View } from 'react-native';
import { Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { useGetDAppList } from 'hooks/static-content/useGetDAppList';

type RoutesType = {
  key: string;
  title: string;
};
type TabbarType = {
  focused: boolean;
};
const Tab = createMaterialTopTabNavigator();
const transparent = { backgroundColor: 'transparent' };
const screenOptions:
  | MaterialTopTabNavigationOptions
  | ((props: { route: RouteProp<ParamListBase, string>; navigation: any }) => MaterialTopTabNavigationOptions)
  | undefined = () => ({
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
  const [searchString] = useState<string>('');
  const {
    browserDApps: { dAppCategories },
  } = useGetDAppList();

  const allTabRoutes = useMemo(() => {
    const categoryTabRoutes = dAppCategories ? dAppCategories?.map(item => ({ key: item.slug, title: item.name })) : [];
    return [{ key: 'all', title: i18n.common.all }, ...categoryTabRoutes];
  }, [dAppCategories]);

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
