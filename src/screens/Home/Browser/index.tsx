import React, { useState } from 'react';
import { ScreenContainer } from 'components/ScreenContainer';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { PredefinedDApps } from 'types/browser';
import BrowserHome from './BrowserHome';
import BrowserHeader from './Shared/BrowserHeader';
import BrowserListByCategory from './BrowserListByCategory';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Dimensions, View } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { FakeSearchInput } from 'screens/Home/Browser/Shared/FakeSearchInput';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import createStylesheet from './styles';
import { FontSemiBold } from 'styles/sharedStyles';
import { Typography } from 'components/design-system-ui';

const Tab = createMaterialTopTabNavigator();
const initialLayout = {
  width: Dimensions.get('window').width,
};

// @ts-ignore
export const BrowserScreen = ({ navigation }) => {
  const theme = useSubWalletTheme().swThemes;
  const stylesheet = createStylesheet(theme);
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const [searchString] = useState<string>('');
  const categoryTabRoutes = dApps.categories.map(item => ({ key: item.id, title: item.name }));
  const allTabRoutes = [{ key: 'all', title: 'All' }, ...categoryTabRoutes];
  const navigationState = useNavigationState(state => state);
  const currentTabIndex = navigationState.routes[navigationState.routes.length - 1].state?.index || 0;

  // @ts-ignore
  const TabComponent = props => <BrowserListByCategory searchString={searchString} {...props} />;

  return (
    <ScreenContainer backgroundColor={theme.colorBgDefault}>
      <>
        <BrowserHeader />

        <FakeSearchInput style={stylesheet.fakeSearch} onPress={() => navigation.navigate('BrowserSearch')} />

        <Tab.Navigator
          initialLayout={initialLayout}
          sceneContainerStyle={{ backgroundColor: 'transparent' }}
          initialRouteName="TabBrowserHome0"
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
            swipeEnabled: !!currentTabIndex,
            tabBarIndicatorStyle: { backgroundColor: 'transparent' },
          })}>
          {allTabRoutes.map((item, index) => {
            if (index === 0) {
              return (
                <Tab.Screen
                  key={'TabBrowserHome0'}
                  name="TabBrowserHome0"
                  component={BrowserHome}
                  options={{
                    tabBarLabel: 'All',
                    tabBarIcon: ({ focused }) => (
                      <View style={{ paddingHorizontal: 8, paddingLeft: 16 }}>
                        <Typography.Text
                          style={{ ...FontSemiBold, color: focused ? theme.colorTextLight1 : theme.colorTextLight4 }}>
                          All
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
            }
            return (
              <Tab.Screen
                key={item.key}
                name={item.key}
                component={TabComponent}
                options={{
                  tabBarLabel: item.title,
                  tabBarIcon: ({ focused }) => (
                    <View style={{ paddingHorizontal: 8 }}>
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
    </ScreenContainer>
  );
};
