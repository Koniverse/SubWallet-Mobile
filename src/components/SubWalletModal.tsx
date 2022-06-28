import React from 'react';
import Modal from 'react-native-modal';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible: () => void;
  modalStyle?: object;
}

const subWalletModalContainer: StyleProp<any> = {
  marginTop: 'auto',
  backgroundColor: ColorMap.dark2,
  alignItems: 'center',
  borderTopLeftRadius: 15,
  borderTopRightRadius: 15,
  paddingTop: 8,
  paddingHorizontal: 16,
};

const subWalletModalSeparator: StyleProp<any> = {
  width: 56,
  height: 4,
  borderRadius: 2,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  marginBottom: 19,
};

export const SubWalletModal = ({ children, modalVisible, onChangeModalVisible, modalStyle }: Props) => {
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
      <View style={[subWalletModalContainer, modalStyle]}>
        <View style={subWalletModalSeparator} />

        {children}
      </View>
    </Modal>
  );
};
