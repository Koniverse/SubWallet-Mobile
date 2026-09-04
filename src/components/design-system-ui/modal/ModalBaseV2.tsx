import React, { useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { DeviceEventEmitter, Dimensions, Linking, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import ModalStyles from './styleV2';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import useConfirmationsInfo from 'hooks/screen/Confirmation/useConfirmationsInfo';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_TRANSLATE_Y = -SCREEN_HEIGHT;
const ROUNDED_TOP_STYLE: ViewStyle = { borderTopLeftRadius: 32, borderTopRightRadius: 32 };

export interface SWModalProps {
  isVisible: boolean;
  setVisible: (arg: boolean) => void;
  height: number;
  children?: React.ReactNode;
  wrapperStyle?: StyleProp<ViewStyle>;
  isFullHeight?: boolean;
  isAllowSwipeDown?: boolean;
  hideHandle?: boolean;
  level?: number;
  onChangeModalVisible?: () => void;
  isUseForceHidden?: boolean;
  disabledOnPressBackDrop?: boolean;
  onBackButtonPress?: () => void;
}

export type SWModalRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
  close: () => void;
};

export const FORCE_HIDDEN_EVENT = 'modalV2ForceHidden';

const ModalBaseV2 = React.forwardRef<SWModalRefProps, SWModalProps>(
  (
    {
      isVisible,
      setVisible,
      height,
      children,
      wrapperStyle,
      isFullHeight = false,
      hideHandle = false,
      level = 1,
      onChangeModalVisible,
      isUseForceHidden,
      isAllowSwipeDown = true,
      disabledOnPressBackDrop = false,
      onBackButtonPress,
    },
    ref,
  ) => {
    const translateY = useSharedValue(0);
    const theme = useSubWalletTheme().swThemes;
    const _styles = ModalStyles(theme, level);
    const { numberOfConfirmations } = useConfirmationsInfo();
    const [isForcedHidden, setForcedHidden] = useState<boolean>(false);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
      const hiddenEvent = DeviceEventEmitter.addListener(FORCE_HIDDEN_EVENT, (isHidden: boolean) => {
        setForcedHidden(isHidden);
      });
      return () => {
        hiddenEvent.remove();
      };
    }, []);

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

      // if (destination === 0) {
      //   runOnJS(timeout)();
      //   runOnJS(setVisible)(false);
      // }

      scheduleOnRN(setIsActive, destination !== 0);

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

    //this useEffect is handle close modal when app receive confirmation
    useEffect(() => {
      const unsubscribe = DeviceEventEmitter.addListener('closeModal', () => {
        onBackButtonPress ? onBackButtonPress() : onClose();
      });

      return () => unsubscribe.remove();
    }, [onBackButtonPress, onClose]);

    useEffect(() => {
      const unsubscribe = Linking.addEventListener('url', () => onClose());

      return () => unsubscribe.remove();
    }, [numberOfConfirmations, onClose]);

    const getIsActive = useCallback(() => isActive, [isActive]);

    useImperativeHandle(ref, () => ({ scrollTo, isActive: getIsActive, close: onClose }), [scrollTo, getIsActive, onClose]);

    const context = useSharedValue({ y: 0 });
    const gesture = Gesture.Pan()
      .enabled(!isFullHeight && !!isAllowSwipeDown)
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate(event => {
        translateY.value = event.translationY + context.value.y;
        translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
      })
      .onEnd(() => {
        if (translateY.value > -height + 10) {
          scheduleOnRN(onClose);
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
            <TouchableOpacity
              activeOpacity={0.8}
              style={_styles.backDropButton}
              onPress={onClose}
              disabled={disabledOnPressBackDrop}
            />
            <GestureDetector gesture={gesture}>
              {
                // @ts-ignore
                <Animated.View
                  style={[
                    _styles.container,
                    wrapperStyle,
                    rSWModalStyle,
                    ROUNDED_TOP_STYLE,
                  ]}>
                  {!isFullHeight && !hideHandle && <View style={_styles.line} />}
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
