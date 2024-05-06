import React from 'react';
import { View } from 'react-native';
import Animated, { SharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import createStylesheet, { activeIndicatorSize, defaultIndicatorSize } from './styles';

const PaginationItem: React.FC<{
  index: number;
  animValue: SharedValue<number>;
}> = props => {
  const { animValue, index } = props;
  const stylesheet = createStylesheet();

  const animContainerStyle = useAnimatedStyle(() => {
    let height;
    let width;
    if (animValue.value === index) {
      height = withTiming(defaultIndicatorSize / 2, { duration: 200 });
      width = withTiming(activeIndicatorSize, { duration: 200 });
    } else {
      height = withTiming(defaultIndicatorSize, { duration: 200 });
      width = withTiming(defaultIndicatorSize, { duration: 200 });
    }
    return {
      height,
      width,
    };
  }, [animValue]);
  const animStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: animValue.value === index ? 'white' : 'grey',
    };
  }, [animValue]);
  return (
    <View style={stylesheet.justifyCenter}>
      <Animated.View style={[stylesheet.defaultIndicator, animContainerStyle]}>
        <Animated.View style={[stylesheet.activeIndicator, animStyle]} />
      </Animated.View>
    </View>
  );
};

export default PaginationItem;
