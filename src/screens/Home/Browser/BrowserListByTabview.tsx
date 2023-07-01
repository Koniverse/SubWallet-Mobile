import React, { useState } from 'react';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { PredefinedDApps } from 'types/browser';
import BrowserListByCategory from './BrowserListByCategory';
import { BrowserListByTabviewProps } from 'routes/index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { ContainerWithSubHeader } from 'components/ContainerWithSubHeader';
import { FakeSearchInput } from 'screens/Home/Browser/Shared/FakeSearchInput';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { View } from 'react-native';
import { Typography } from 'components/design-system-ui';
import { FontSemiBold } from 'styles/sharedStyles';

const Tab = createMaterialTopTabNavigator();
const navigationType: Record<string, string> = {
  BOOKMARK: 'Favorites',
  RECOMMENDED: 'Recommended',
};

export const BrowserListByTabview = ({ route, navigation }: BrowserListByTabviewProps) => {
  const theme = useSubWalletTheme().swThemes;
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const [searchString] = useState<string>('');
  const categoryTabRoutes = dApps.categories.map(item => ({ key: item.id, title: item.name }));
  const allTabRoutes = [{ key: 'all', title: 'All' }, ...categoryTabRoutes];
  // @ts-ignore
  const TabComponent = restProps => (
    <BrowserListByCategory searchString={searchString} navigationType={route.params.type} {...restProps} />
  );

  const title = navigationType[route.params.type];

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
          sceneContainerStyle={{ backgroundColor: 'transparent' }}
          screenOptions={() => ({
            tabBarStyle: { height: 28, backgroundColor: 'transparent' },
            tabBarItemStyle: {
              width: 'auto',
              paddingLeft: 0,
              paddingRight: 0,
            },
            tabBarIconStyle: { width: 'auto', marginLeft: -2, marginRight: -2, top: -12 },
            tabBarScrollEnabled: true,
            lazy: true,
            tabBarShowLabel: false,
            tabBarIndicatorStyle: { backgroundColor: 'transparent' },
          })}
          style={{ backgroundColor: 'transparent' }}>
          {allTabRoutes.map(item => {
            return (
              <Tab.Screen
                key={item.key}
                name={item.key}
                component={TabComponent}
                options={{
                  tabBarLabel: item.title,
                  tabBarIcon: ({ focused }) => (
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingLeft: item.title.toLocaleLowerCase() === 'all' ? 16 : undefined,
                      }}>
                      <Typography.Text
                        style={{ ...FontSemiBold, color: focused ? theme.colorTextLight1 : theme.colorTextLight4 }}>
                        {item.title}
                      </Typography.Text>
                      <View
                        style={{
                          height: 2,
                          marginTop: theme.marginXXS,
                          backgroundColor: focused ? theme.colorPrimary : 'transparent',
                        }}
                      />
                    </View>
                  ),
                }}
              />
            );
          })}
        </Tab.Navigator>
      </>
    </ContainerWithSubHeader>
  );
};
