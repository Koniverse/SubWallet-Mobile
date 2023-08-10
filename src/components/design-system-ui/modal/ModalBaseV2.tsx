import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { Dimensions, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import ModalStyles from './styleV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useConfirmationsInfo from 'hooks/screen/Confirmation/useConfirmationsInfo';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT;

export interface SWModalProps {
  isVisible: boolean;
  setVisible: (arg: boolean) => void;
  height: number;
  children?: React.ReactNode;
  wrapperStyle?: StyleProp<ViewStyle>;
  isFullHeight?: boolean;
  level?: number;
  onChangeModalVisible?: () => void;
  isUseForceHidden?: boolean;
}

export type SWModalRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
  close: () => void;
};

const ModalBaseV2 = React.forwardRef<SWModalRefProps, SWModalProps>(
  (
    {
      isVisible,
      setVisible,
      height,
      children,
      wrapperStyle,
      isFullHeight = false,
      level = 1,
      onChangeModalVisible,
      isUseForceHidden,
    },
    ref,
  ) => {
    const translateY = useSharedValue(0);
    const active = useSharedValue(false);
    const theme = useSubWalletTheme().swThemes;
    const _styles = ModalStyles(theme, level);
    const { numberOfConfirmations } = useConfirmationsInfo();
    const [isForcedHidden, setForcedHidden] = useState<boolean>(false);
    useEffect(() => {
      if (isUseForceHidden && !!numberOfConfirmations) {
        setForcedHidden(true);
      } else {
        setForcedHidden(false);
      }
    }, [isUseForceHidden, numberOfConfirmations]);

    useEffect(() => {
      if (!isForcedHidden && isVisible) {
        scrollTo(-height);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, height, isForcedHidden]);
    // const timeout = () => {
    //   setTimeout(() => {
    //     setVisible(false);
    //     onChangeModalVisible && onChangeModalVisible();
    //   }, 50);
    // };
    const scrollTo = useCallback((destination: number) => {
      'worklet';
      active.value = destination !== 0;

      // if (destination === 0) {
      //   runOnJS(timeout)();
      //   runOnJS(setVisible)(false);
      // }

      translateY.value = withTiming(
        destination,
        {
          duration: 250,
        },
        () => {},
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onClose = useCallback(() => {
      onChangeModalVisible && onChangeModalVisible();
      setVisible(false);
      scrollTo(0);
    }, [onChangeModalVisible, scrollTo, setVisible]);

    const isActive = useCallback(() => {
      return active.value;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({ scrollTo, isActive, close: onClose }), [scrollTo, isActive, onClose]);

    const context = useSharedValue({ y: 0 });
    const gesture = Gesture.Pan()
      .enabled(!isFullHeight)
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate(event => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      })
      .onEnd(() => {
        if (translateY.value > -height + 10) {
          runOnJS(onClose)();
        } else if (translateY.value < context.value.y - 10) {
          scrollTo(-height);
        }
      });

    // @ts-ignore
    const rSWModalStyle = useAnimatedStyle(() => {
      // const minHeight = MAX_TRANSLATE_Y - 80;
      // const borderRadius = interpolate(translateY.value, [minHeight, MAX_TRANSLATE_Y], [5, 32], Extrapolate.CLAMP);

      return {
        transform: [{ translateY: translateY.value }],
      };
    });

    return (
      <>
        {!isForcedHidden && isVisible && (
          <>
            <TouchableOpacity activeOpacity={0.8} style={_styles.backDropButton} onPress={onClose} />
            <GestureDetector gesture={gesture}>
              {
                // @ts-ignore
                <Animated.View
                  style={[
                    _styles.container,
                    wrapperStyle,
                    rSWModalStyle,
                    { borderTopLeftRadius: 32, borderTopRightRadius: 32 },
                  ]}>
                  {!isFullHeight && <View style={_styles.line} />}
                  {children}
                </Animated.View>
              }
            </GestureDetector>
          </>
        )}
      </>
    );
  },
);

export default ModalBaseV2;
