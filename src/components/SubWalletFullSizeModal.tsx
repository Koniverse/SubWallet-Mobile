import React from 'react';
import Modal from 'react-native-modal';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { ModalProps } from 'react-native-modal/dist/modal';

interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  modalStyle?: object;
  animationIn?: ModalProps['animationIn'];
  animationOut?: ModalProps['animationOut'];
}

const subWalletModalContainer: StyleProp<any> = {
  flex: 1,
  backgroundColor: ColorMap.dark1,
  alignItems: 'center',
  paddingTop: 8,
};

export const SubWalletFullSizeModal = ({ children, modalVisible, modalStyle, animationIn, animationOut }: Props) => {
  return (
    <Modal
      isVisible={modalVisible}
      style={{ margin: 0 }}
      animationIn={animationIn || 'slideInUp'}
      animationOut={animationOut || 'slideOutDown'}
      useNativeDriver
      hideModalContentWhileAnimating
      propagateSwipe>
      <View style={[subWalletModalContainer, modalStyle]}>{children}</View>
    </Modal>
  );
};
