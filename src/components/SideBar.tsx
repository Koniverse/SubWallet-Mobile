import Modal, { Direction, SupportedAnimation } from "react-native-modal";
import {Dimensions, SafeAreaView, StyleSheet, Text, View} from "react-native";
import React, {useMemo} from "react";
import {useSubWalletTheme} from "hooks/useSubWalletTheme";

interface Props {
  visible: boolean;
  onCloseSideBar: () => void;
  sideBarStyle: Object;
  animationIn: SupportedAnimation;
  animationOut: SupportedAnimation;
  swipeDirection: Direction | Direction[] | undefined;
}

export const SideBar = ({ onCloseSideBar, visible, sideBarStyle, animationIn, animationOut, swipeDirection }: Props) => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(() => StyleSheet.create({

    contentWrapperStyle: {
      backgroundColor: theme.background,
      flex: 1,
    }
  }), []);

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
      style={sideBarStyle}
    >
      <SafeAreaView style={styles.contentWrapperStyle}>
        <View>
          <Text>{123123}</Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
