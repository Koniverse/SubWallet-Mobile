/* eslint-disable react-hooks/exhaustive-deps */
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
// @ts-ignore
import SVGImage from './loading-outlined.svg';
import ActivityIndicatorStyles from './style';

interface ActivityIndicatorProps {
  size: number;
  indicatorColor?: string;
}

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ size = 16, indicatorColor = '#fff' }) => {
  const rotation = useSharedValue(0);
  const theme = useSubWalletTheme().swThemes;
  const _style = ActivityIndicatorStyles(theme);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotateZ: `${rotation.value}deg`,
        },
      ],
    };
  }, [rotation.value]);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      200,
    );
    return () => cancelAnimation(rotation);
  }, []);

  return (
    <View style={_style.container}>
      <Animated.View style={[animatedStyles]}>
        <SVGImage width={size} height={size} color={indicatorColor} />
      </Animated.View>
    </View>
  );
};

export default ActivityIndicator;
