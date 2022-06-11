import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SceneRendererProps, TabBar, TabView } from 'react-native-tab-view';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { sharedStyles } from 'styles/sharedStyles';

interface Props {
  renderScene: ({ route, jumpTo, position }: SceneRendererProps & { route: any }) => JSX.Element;
  routes: { title: string; key: string }[];
}

export const HorizontalTabView = ({ renderScene, routes }: Props) => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginTop: 50,
        },
        scene: {
          flex: 1,
        },
        tabTitle: {
          ...sharedStyles.largerText,
          fontWeight: '600',
        },
        tabBar: {
          backgroundColor: theme.background2,
          minHeight: 36,
        },
      }),
    [theme],
  );
  const [index, setIndex] = React.useState(0);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      style={styles.container}
      renderTabBar={props => (
        <TabBar
          {...props}
          inactiveColor={'#FFF'}
          indicatorStyle={{ backgroundColor: '#FFF' }}
          tabStyle={styles.tabBar}
          renderLabel={({ route, color }) => (
            <Text style={[styles.tabTitle, { color }]} numberOfLines={1}>
              {route.title}
            </Text>
          )}
        />
      )}
    />
  );
};
