import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SceneRendererProps, TabBar, TabView } from 'react-native-tab-view';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';

interface Props {
  renderScene: ({ route, jumpTo, position }: SceneRendererProps & { route: any }) => JSX.Element;
  routes: { title: string; key: string }[];
}

const tabTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
};
const tabBar: StyleProp<any> = {
  backgroundColor: '#222222',
  marginLeft: 16,
  marginRight: 16,
};
const tabBarIndicator: StyleProp<any> = {
  backgroundColor: '#FFF',
};

export const HorizontalTabView = ({ renderScene, routes }: Props) => {
  const [index, setIndex] = React.useState(0);

  return (
    <View style={{ width: '100%', height: '100%' }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        renderTabBar={props => (
          <View style={{ backgroundColor: '#222' }}>
            <TabBar
              {...props}
              style={tabBar}
              indicatorStyle={tabBarIndicator}
              renderLabel={({ route, color }) => (
                <Text style={[tabTitle, { color }]} numberOfLines={1}>
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
