import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootNavigationProps } from 'routes/index';
import { ScreenContainer } from 'components/ScreenContainer';
import { ColorMap } from 'styles/color';
import { predefinedDApps } from '../../../predefined/dAppSites';
import { PredefinedDApps } from 'types/browser';
import BrowserHome from './BrowserHome';
import BrowserHeader from './Shared/BrowserHeader';
import { TabView, TabBar, SceneRendererProps } from 'react-native-tab-view';

export const BrowserScreen = () => {
  const [dApps] = useState<PredefinedDApps>(predefinedDApps);
  const [tabviewIndex, ontabviewIndexChange] = useState<number>(1);
  // const historyItems = useSelector((state: RootState) => state.browser.history);
  // const bookmarkItems = useSelector((state: RootState) => state.browser.bookmarks);
  const navigation = useNavigation<RootNavigationProps>();
  const tabRoutes = dApps.categories.map(item => ({ key: item.id, title: item.name }));

  const renderScene = ({ route, jumpTo, position }) => {
    if (position === 0) {
      return <BrowserHome tabRoute={route} jumpTo={jumpTo} position={position} />;
    }

    return <BrowserHome tabRoute={route} jumpTo={jumpTo} position={position} />;
  };
  const renderTabBar = (props: SceneRendererProps & { navigationState: State }) => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={{ backgroundColor: 'blue', width: 0.77, left: 0 }}
      style={{ backgroundColor: 'transparent' }}
      tabStyle={{ width: 'auto', paddingBottom: 0, justifyContent: 'flex-end' }}
      labelStyle={{ textTransform: 'capitalize', paddingBottom: 0, marginLeft: 4 }}
    />
  );

  return (
    <ScreenContainer backgroundColor={ColorMap.dark1}>
      <>
        <BrowserHeader />

        {tabRoutes.length > 0 && (
          <TabView
            lazy
            navigationState={{
              index: tabviewIndex,
              routes: tabRoutes,
            }}
            initialLayout={{ width: Dimensions.get('window').width }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={ontabviewIndexChange}
          />
        )}
      </>
    </ScreenContainer>
  );
};
