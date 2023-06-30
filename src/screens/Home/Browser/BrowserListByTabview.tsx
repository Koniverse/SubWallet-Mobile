import React, { useState } from 'react';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { PredefinedDApps } from 'types/browser';
import BrowserListByCategory from './BrowserListByCategory';
import { Search } from 'components/Search';
import { BrowserListByTabviewProps } from 'routes/index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import BrowserHeader from './Shared/BrowserHeader';
import { Icon } from 'components/design-system-ui';
import { CaretLeft } from 'phosphor-react-native';
import { Text, TouchableOpacity } from 'react-native';

const Tab = createMaterialTopTabNavigator();
const navigationType = {
  BOOKMARK: 'Favorite',
  RECOMMENDED: 'Recommended',
};
const tabScreenOption = {
  tabBarActiveTintColor: 'white',
  tabBarLabelStyle: { fontSize: 12, textTransform: 'capitalize' },
  tabBarStyle: { backgroundColor: 'transparent' },
  tabBarItemStyle: { width: 'auto', paddingBottom: 0 },
  tabBarIndicatorStyle: { backgroundColor: 'blue', width: 0.77, left: 0 },
  tabBarScrollEnabled: true,
  lazy: true,
};
export const BrowserListByTabview = ({ route, navigation }: BrowserListByTabviewProps) => {
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const [searchString, setSearchString] = useState<string>('');
  const categoryTabRoutes = dApps.categories.map(item => ({ key: item.id, title: item.name }));
  const allTabRoutes = [{ key: 'all', title: 'All' }, ...categoryTabRoutes];
  const TabComponent = restProps => (
    <BrowserListByCategory searchString={searchString} navigationType={route.params.type} {...restProps} />
  );

  return (
    <ScreenContainer backgroundColor={ColorMap.dark1}>
      <>
        <BrowserHeader />
        <Search
          autoFocus={false}
          placeholder={'Search or enter website'}
          onClearSearchString={() => setSearchString('')}
          onSearch={setSearchString}
          searchText={searchString}
          style={{ marginTop: 16, marginHorizontal: 16 }}
        />

        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 10, paddingHorizontal: 10 }}
          onPress={() => navigation.goBack()}>
          <Icon phosphorIcon={CaretLeft} customSize={18} />
          <Text style={{ color: 'white' }}>{navigationType[route.params.type]}</Text>
        </TouchableOpacity>

        <Tab.Navigator overScrollMode={'always'} initialRouteName="TabBrowserHome0" screenOptions={tabScreenOption}>
          {allTabRoutes.map(item => {
            return (
              <Tab.Screen
                key={item.key}
                name={item.key}
                component={TabComponent}
                options={{ tabBarLabel: item.title }}
              />
            );
          })}
        </Tab.Navigator>
      </>
    </ScreenContainer>
  );
};
