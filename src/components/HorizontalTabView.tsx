import React, { useMemo } from 'react';
import {StyleSheet, Text, View} from 'react-native';
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
        },
        scene: {
          flex: 1,
        },
        tabTitle: {
          ...sharedStyles.mainText,
          fontWeight: '600',
        },
        tabBar: {
          backgroundColor: '#222222',
          marginLeft: 16,
          marginRight: 16,
        },
        tabBarIndicator: {
          backgroundColor: '#FFF',
        },
      }),
    [],
  );
  const [index, setIndex] = React.useState(0);

  return (
    <View style={{ width: '100%', height: '100%' }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        style={styles.container}
        renderTabBar={props => (
          <View style={{ backgroundColor: '#222' }}>
            <TabBar
              {...props}
              style={styles.tabBar}
              indicatorStyle={styles.tabBarIndicator}
              renderLabel={({ route, color }) => (
                <Text style={[styles.tabTitle, { color }]} numberOfLines={1}>
                  {route.title}
                </Text>
              )}
            />
          </View>
        )}
      />
    </View>
  );
};
