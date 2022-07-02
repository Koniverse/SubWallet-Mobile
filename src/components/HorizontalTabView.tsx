import React from 'react';
import { StyleProp, Text, View } from 'react-native';
import { SceneRendererProps, TabBar, TabView } from 'react-native-tab-view';
import { FontSemiBold, sharedStyles } from 'styles/sharedStyles';
import { ColorMap } from 'styles/color';

interface Props {
  renderScene: ({ route, jumpTo, position }: SceneRendererProps & { route: any }) => JSX.Element;
  routes: { title: string; key: string }[];
}

const tabTitle: StyleProp<any> = {
  ...sharedStyles.mediumText,
  ...FontSemiBold,
};
const tabBar: StyleProp<any> = {
  backgroundColor: ColorMap.dark2,
  marginLeft: 16,
  marginRight: 16,
};
const tabBarIndicator: StyleProp<any> = {
  backgroundColor: ColorMap.light,
};

export const HorizontalTabView = ({ renderScene, routes }: Props) => {
  const [index, setIndex] = React.useState(0);

  return (
    <TabView
      navigationState={{ index, routes }}
      style={{ backgroundColor: ColorMap.dark1 }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={props => (
        <View style={{ backgroundColor: ColorMap.dark2 }}>
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
  );
};
