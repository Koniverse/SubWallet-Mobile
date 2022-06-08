import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import Modal from "react-native-modal";
import { useSubWalletTheme } from "hooks/useSubWalletTheme";
interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible: () => void;
}

export const SubWalletModal = ({ children, modalVisible, onChangeModalVisible }: Props) => {
  const theme = useSubWalletTheme().colors;
  const styles = useMemo(() => StyleSheet.create({
  }), []);

  return (
    <Modal
      isVisible={modalVisible}
      swipeDirection="down"
      style={{ margin: 0 }}
      backdropColor={'rgba(51, 51, 51, 1)'}
      onSwipeComplete={onChangeModalVisible}
      onBackdropPress={onChangeModalVisible}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      // useNativeDriver
      hideModalContentWhileAnimating
      propagateSwipe
    >
      {children}
    </Modal>
  );
}
