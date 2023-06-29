import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { PredefinedDApps } from 'types/browser';
import BrowserHome from './BrowserHome';
import BrowserHeader from './Shared/BrowserHeader';
import BrowserListByCategory from './BrowserListByCategory';
// import { TabView, TabBar, SceneRendererProps } from 'react-native-tab-view';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();
const tabScreenOption = {
  tabBarActiveTintColor: 'white',
  tabBarLabelStyle: { fontSize: 12, textTransform: 'capitalize' },
  tabBarStyle: { backgroundColor: 'transparent' },
  tabBarItemStyle: { width: 'auto', paddingBottom: 0 },
  tabBarIndicatorStyle: { backgroundColor: 'blue', width: 0.77, left: 0 },
  tabBarScrollEnabled: true,
  lazy: true,
};
export const BrowserScreen = () => {
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const [tabviewIndex, ontabviewIndexChange] = useState<number>(0);
  // const historyItems = useSelector((state: RootState) => state.browser.history);
  // const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const navigation = useNavigation<RootNavigationProps>();
  const categoryTabRoutes = dApps.categories.map(item => ({ key: item.id, title: item.name }));
  const allTabRoutes = [{ key: 'all', title: 'All' }, ...categoryTabRoutes];

  return (
    <ScreenContainer backgroundColor={ColorMap.dark1}>
      <>
        <BrowserHeader />

        <Tab.Navigator overScrollMode={'always'} initialRouteName="TabBrowserHome0" screenOptions={tabScreenOption}>
          {allTabRoutes.map((item, index) => {
            if (index === 0) {
              return <Tab.Screen name="TabBrowserHome0" component={BrowserHome} options={{ tabBarLabel: 'All' }} />;
            }
            return (
              <Tab.Screen
                name={item.key}
                component={BrowserListByCategory}
                options={{ tabBarLabel: item.title }}
                categoryID={item.key}
              />
            );
          })}
        </Tab.Navigator>
      </>
    </ScreenContainer>
  );
};
