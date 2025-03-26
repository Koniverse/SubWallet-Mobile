import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring } from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Icon from 'components/design-system-ui/icon';
import { WarningCircle } from 'phosphor-react-native';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { convertHexColorToRGBA } from 'utils/color';
import { ThemeTypes } from 'styles/themes';
import { FontMedium } from 'styles/sharedStyles';
import { useSelector } from 'react-redux';
import { RootState } from 'stores/index';
import { VoidFunction } from 'types/index';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';

const { width, height } = Dimensions.get('window'); // Get screen width

interface Props {
  navigateToNotification?: VoidFunction;
}

const FloatingBubble = ({ navigateToNotification }: Props) => {
  const { isLocked } = useSelector((state: RootState) => state.accountState);
  const translateX = useSharedValue(10);
  const translateY = useSharedValue(height / 3);
  const opacity = useSharedValue(1); // Control text visibility
  const bubbleWidth = useSharedValue(368);
  const textTranslateX = useSharedValue(0);
  const [showText, setShowText] = useState(true);
  const theme = useSubWalletTheme().swThemes;
  const styles = createStyle(theme);

  useEffect(() => {
    // Hide text after 3 seconds
    if (!isLocked) {
      setTimeout(() => {
        textTranslateX.value = withTiming(-20, { duration: 500 });
        opacity.value = withTiming(0, { duration: 500 }); // Fade out text
        bubbleWidth.value = withTiming(48, { duration: 500 }); // Shrink to fit only the icon
        setTimeout(() => setShowText(false), 500);
      }, 3000);
    }
  }, [bubbleWidth, isLocked, opacity, textTranslateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    width: bubbleWidth.value,
  }));

  const onGestureEvent = event => {
    translateX.value = event.nativeEvent.absoluteX - 30;
    translateY.value = event.nativeEvent.absoluteY - 30;
  };

  const onGestureEnd = () => {
    // Snap to the left or right edge when released
    translateX.value = withSpring(translateX.value > width / 2 ? width - 60 : 10);
  };

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
      <Animated.View style={[styles.bubble, animatedStyle]}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          activeOpacity={BUTTON_ACTIVE_OPACITY}
          onPress={navigateToNotification}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 32,
              backgroundColor: convertHexColorToRGBA(theme.colorWarning, 0.1),
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Icon size={'md'} phosphorIcon={WarningCircle} iconColor={theme.colorWarning} weight={'fill'} />
          </View>

          {showText && (
            <Animated.Text style={[styles.text, { opacity }]} numberOfLines={1} ellipsizeMode="tail">
              Transaction in progress, do not close the app!
            </Animated.Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

function createStyle(theme: ThemeTypes) {
  return StyleSheet.create({
    bubble: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colorBgSecondary,
      padding: 8,
      borderRadius: 30,
      position: 'absolute',
      justifyContent: 'center',
      zIndex: 1,
      maxWidth: 368,
    },
    image: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    text: {
      color: theme.colorWarning,
      marginHorizontal: 8,
      fontSize: theme.fontSize,
      lineHeight: theme.fontSize * theme.lineHeight,
      ...FontMedium,
    },
  });
}

export default FloatingBubble;
