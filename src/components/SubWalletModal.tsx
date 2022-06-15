import React from 'react';
import Modal from 'react-native-modal';
interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible: () => void;
}

export const SubWalletModal = ({ children, modalVisible, onChangeModalVisible }: Props) => {
  return (
    <Modal
      isVisible={modalVisible}
      swipeDirection="down"
      style={{ margin: 0 }}
      backdropColor={'rgba(22, 22, 22, 0.8)'}
      onSwipeComplete={onChangeModalVisible}
      onBackdropPress={onChangeModalVisible}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      // useNativeDriver
      hideModalContentWhileAnimating
      propagateSwipe>
      {children}
    </Modal>
  );
};
