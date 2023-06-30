import React, { useState } from 'react';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { PredefinedDApps } from 'types/browser';
import BrowserHome from './BrowserHome';
import BrowserHeader from './Shared/BrowserHeader';
import BrowserListByCategory from './BrowserListByCategory';
import { Search } from 'components/Search';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Dimensions, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'components/design-system-ui';
import { MagnifyingGlass } from 'phosphor-react-native';
import { useNavigationState } from '@react-navigation/native';
import browserStyles from './styles';

const Tab = createMaterialTopTabNavigator();
const defaultTabScreenOption = {
  tabBarActiveTintColor: 'white',
  tabBarLabelStyle: { fontSize: 12, textTransform: 'capitalize' },
  tabBarStyle: { backgroundColor: 'transparent' },
  tabBarItemStyle: { width: 'auto', paddingBottom: 0 },
  tabBarIndicatorStyle: { backgroundColor: 'blue', width: 0.77, left: 0 },
  tabBarScrollEnabled: true,
  lazy: true,
};
const initialLayout = {
  width: Dimensions.get('window').width,
};
const styles = browserStyles();
export const BrowserScreen = ({ navigation }) => {
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const [searchString, setSearchString] = useState<string>('');
  const categoryTabRoutes = dApps.categories.map(item => ({ key: item.id, title: item.name }));
  const allTabRoutes = [{ key: 'all', title: 'All' }, ...categoryTabRoutes];
  const navigationState = useNavigationState(state => state);
  const currentTabIndex = navigationState.routes[navigationState.routes.length - 1].state?.index || 0;
  const tabscreenOption = { ...defaultTabScreenOption, swipeEnabled: !!currentTabIndex };
  const TabComponent = props => <BrowserListByCategory searchString={searchString} {...props} />;

  return (
    <ScreenContainer backgroundColor={ColorMap.dark1}>
      <>
        <BrowserHeader />
        {/* TODO: check when change tab show search button or input */}
        {currentTabIndex === 0 ? (
          <TouchableOpacity style={styles.fakeSearchInput} onPress={() => navigation.navigate('BrowserSearch')}>
            <Icon phosphorIcon={MagnifyingGlass} />
            <Text style={styles.fakeSearchInputText}>Search or enter website</Text>
          </TouchableOpacity>
        ) : (
          <Search
            autoFocus={false}
            placeholder={'Search or enter website'}
            onClearSearchString={() => setSearchString('')}
            onSearch={setSearchString}
            searchText={searchString}
            style={styles.searchInputStyle}
          />
        )}

        <Tab.Navigator initialLayout={initialLayout} initialRouteName="TabBrowserHome0" screenOptions={tabscreenOption}>
          {allTabRoutes.map((item, index) => {
            if (index === 0) {
              return (
                <Tab.Screen
                  key={'TabBrowserHome0'}
                  name="TabBrowserHome0"
                  component={BrowserHome}
                  options={{ tabBarLabel: 'All' }}
                />
              );
            }
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
