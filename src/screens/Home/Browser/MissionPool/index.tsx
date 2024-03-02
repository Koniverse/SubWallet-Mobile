import React, { useState } from 'react';
import { MissionPoolsByTabviewProps } from 'routes/index';
import { MaterialTopTabNavigationOptions, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Animated, View } from 'react-native';
import { Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { missionCategories } from 'screens/Home/Browser/MissionPool/predefined';
import { MissionPoolsByCategory } from 'screens/Home/Browser/MissionPool/MissionPoolsByCategory';
import { Search } from 'components/Search';
import { MissionPoolsContext } from 'screens/Home/Browser/MissionPool/context';

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
  animationEnabled: false,
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
export const MissionPoolsByTabview = ({ route, navigation }: MissionPoolsByTabviewProps) => {
  const theme = useSubWalletTheme().swThemes;
  const [searchString, setSearchString] = useState<string>('');
  const categoryTabRoutes = missionCategories.map(item => ({ key: item.slug, title: item.name }));
  const allTabRoutes = [{ key: 'all', title: i18n.common.all }, ...categoryTabRoutes];

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
    <MissionPoolsContext.Provider value={{ searchString }}>
      <ContainerWithSubHeader
        title={i18n.header.missionPools}
        showLeftBtn
        onPressBack={() => {
          navigation.canGoBack() && navigation.goBack();
        }}>
        <>
          <Search
            autoFocus={false}
            placeholder={i18n.placeholder.campaignName}
            onClearSearchString={() => setSearchString('')}
            onSearch={setSearchString}
            searchText={searchString}
            style={{ marginBottom: theme.padding, marginTop: theme.marginXS, marginHorizontal: theme.padding }}
            isShowFilterBtn={false}
          />

          <Tab.Navigator
            overScrollMode={'always'}
            sceneContainerStyle={transparent}
            screenOptions={screenOptions}
            screenListeners={screenListener}
            style={transparent}>
            {allTabRoutes.map(item => {
              return (
                <Tab.Screen
                  key={item.key}
                  name={item.key}
                  initialParams={{ navigationType: route.params.type }}
                  component={MissionPoolsByCategory}
                  options={tabScreenOptions(item)}
                />
              );
            })}
          </Tab.Navigator>
        </>
      </ContainerWithSubHeader>
    </MissionPoolsContext.Provider>
  );
};
