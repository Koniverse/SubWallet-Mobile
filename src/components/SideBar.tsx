import Modal, { Direction, SupportedAnimation } from 'react-native-modal';
import { SafeAreaView, StyleProp, Text, View } from 'react-native';
import React from 'react';
import { ColorMap } from 'styles/color';

interface Props {
  visible: boolean;
  onCloseSideBar: () => void;
  sideBarStyle: Object;
  animationIn: SupportedAnimation;
  animationOut: SupportedAnimation;
  swipeDirection: Direction | Direction[] | undefined;
}

const contentWrapperStyle: StyleProp<any> = {
  backgroundColor: ColorMap.dark1,
  flex: 1,
};

export const SideBar = ({
  onCloseSideBar,
  visible,
  sideBarStyle,
  animationIn,
  animationOut,
  swipeDirection,
}: Props) => {
  return (
    <Modal
      isVisible={visible}
      // backdropOpacity={0.18}
      backdropColor={'rgba(51, 51, 51, 1)'}
      statusBarTranslucent={true}
      onBackdropPress={onCloseSideBar}
      onSwipeComplete={onCloseSideBar}
      animationIn={animationIn}
      animationOut={animationOut}
      swipeDirection={swipeDirection}
      useNativeDriver
      hideModalContentWhileAnimating
      propagateSwipe
      style={sideBarStyle}>
      <SafeAreaView style={contentWrapperStyle}>
        <View>
          <Text>{123123}</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
