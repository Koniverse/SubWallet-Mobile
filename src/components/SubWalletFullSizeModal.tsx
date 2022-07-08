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
  flex: 1,
  backgroundColor: ColorMap.dark1,
  alignItems: 'center',
  paddingTop: 8,
};

export const SubWalletFullSizeModal = ({ children, modalVisible, modalStyle }: Props) => {
  return (
    <Modal
      isVisible={modalVisible}
      style={{ margin: 0 }}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      useNativeDriver
      hideModalContentWhileAnimating
      propagateSwipe>
      <View style={[subWalletModalContainer, modalStyle]}>{children}</View>
    </Modal>
  );
};
