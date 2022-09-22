import React from 'react';
import { SafeAreaView, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import Modal from 'components/Modal';
interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  modalStyle?: object;
  onModalHide?: () => void;
  isFullHeight?: boolean;
}

const getSubWalletModalContainerStyle = (isFullHeight: boolean): StyleProp<any> => {
  return {
    marginTop: 'auto',
    backgroundColor: ColorMap.dark2,
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 8,
    paddingHorizontal: 16,
    flex: isFullHeight ? 1 : undefined,
  };
};

const subWalletModalSeparator: StyleProp<any> = {
  width: 56,
  height: 4,
  borderRadius: 2,
  backgroundColor: ColorMap.modalSeparatorColor,
  marginBottom: 19,
  textAlign: 'center',
};

export const SubWalletModal = ({
  children,
  modalVisible,
  onChangeModalVisible,
  modalStyle,
  onModalHide,
  isFullHeight = false,
}: Props) => {
  return (
    <Modal
      isVisible={modalVisible}
      onModalHide={onModalHide}
      swipeDirection={onChangeModalVisible ? 'down' : undefined}
      style={{ margin: 0 }}
      backdropColor={ColorMap.modalBackDropDarkColor}
      onSwipeComplete={onChangeModalVisible}
      onBackdropPress={onChangeModalVisible}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      // useNativeDriver
      hideModalContentWhileAnimating
      propagateSwipe>
      <View style={[getSubWalletModalContainerStyle(!!isFullHeight), modalStyle]}>
        <View style={{ width: '100%', paddingBottom: 16, alignItems: 'center', flex: isFullHeight ? 1 : undefined }}>
          <View style={subWalletModalSeparator} />

          {children}
        </View>
        <SafeAreaView />
      </View>
    </Modal>
  );
};
