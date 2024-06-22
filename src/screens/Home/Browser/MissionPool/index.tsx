import React, { useMemo } from 'react';
import { MaterialTopTabNavigationOptions, createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { Animated, View } from 'react-native';
import { Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';
import { ThemeTypes } from 'styles/themes';
import i18n from 'utils/i18n/i18n';
import { ParamListBase, RouteProp, useNavigation } from '@react-navigation/native';
import { missionCategories, MissionPoolType } from 'screens/Home/Browser/MissionPool/predefined';
import { MissionPoolsByCategory } from 'screens/Home/Browser/MissionPool/MissionPoolsByCategory';
import { MissionPoolsNavigationProps } from 'routes/home';
import ImageSlider from 'components/common/ImageSlider';
import { MagnifyingGlass } from 'phosphor-react-native';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { computeStatus } from 'utils/missionPools';
import { RootNavigationProps } from 'routes/index';

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

export const MissionPoolsByTabview = ({ route }: MissionPoolsNavigationProps) => {
  const theme = useSubWalletTheme().swThemes;
  const categoryTabRoutes = missionCategories.map(item => ({ key: item.slug, title: item.name }));
  const allTabRoutes = [...categoryTabRoutes];
  const { missions } = useSelector((state: RootState) => state.missionPool);

  const rootNavigation = useNavigation<RootNavigationProps>();

  const av = new Animated.Value(0);
  av.addListener(() => {
    return;
  });

  const tabScreenOptions = (item: RoutesType) => {
    return {
      tabBarIcon: ({ focused }: TabbarType) => tabbarIcon(focused, item, theme),
    };
  };

  const computedMission = useMemo(() => {
    return missions && missions.length
      ? missions.map(item => {
          return {
            ...item,
            status: computeStatus(item),
          };
        })
      : [];
  }, [missions]);

  const liveMissionImages = useMemo(() => {
    return computedMission.filter(item => item.status === MissionPoolType.LIVE).map(_item => _item.backdrop_image);
  }, [computedMission]);

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
    <>
      <ContainerWithSubHeader
        isShowMainHeader
        title={i18n.header.missionPools}
        showLeftBtn={false}
        titleTextAlign={'left'}
        rightIcon={MagnifyingGlass}
        onPressRightIcon={() => rootNavigation.navigate('MissionPoolSearchByTabView', { type: 'all' })}>
        <ImageSlider data={liveMissionImages} onPressItem={() => {}} />
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
      </ContainerWithSubHeader>
    </>
  );
};
