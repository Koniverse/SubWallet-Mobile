import React from 'react';
import { SafeAreaView, StyleProp, Text, View } from 'react-native';
import { ColorMap } from 'styles/color';
import ModalBase from 'components/Modal/Base/ModalBase';
import { FontSemiBold } from 'styles/sharedStyles';
export interface SWModalProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  modalStyle?: StyleProp<any>;
  onModalHide?: () => void; // Auto trigger when close modal
  isFullHeight?: boolean;
  modalTitle?: string;
}

const getSubWalletModalContainerStyle = (isFullHeight: boolean): StyleProp<any> => {
  return {
    marginTop: 'auto',
    backgroundColor: '#0C0C0C',
    alignItems: 'center',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingTop: 8,
    // paddingHorizontal: 16,
    flex: isFullHeight ? 1 : undefined,
  };
};

const subWalletModalSeparator: StyleProp<any> = {
  width: 70,
  height: 5,
  borderRadius: 100,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  marginBottom: 22,
  textAlign: 'center',
};

const SwModal = ({
  children,
  footer,
  modalVisible,
  onChangeModalVisible,
  modalStyle,
  modalTitle,
  onModalHide,
  isFullHeight = false,
}: SWModalProps) => {
  return (
    <ModalBase
      isVisible={modalVisible}
      onModalHide={onModalHide} // Auto trigger when close modal
      swipeDirection={onChangeModalVisible ? 'down' : undefined}
      style={{ margin: 0 }}
      backdropColor={'#1A1A1A'}
      backdropOpacity={0.8}
      onSwipeComplete={onChangeModalVisible}
      onBackdropPress={onChangeModalVisible}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}
      avoidKeyboard={true}
      // useNativeDriver
      hideModalContentWhileAnimating
      propagateSwipe>
      <View style={[getSubWalletModalContainerStyle(!!isFullHeight), modalStyle]}>
        <View
          style={{
            width: '100%',
            paddingBottom: 16,
            paddingHorizontal: 16,
            alignItems: 'center',
            flex: isFullHeight ? 1 : undefined,
          }}>
          <View style={subWalletModalSeparator} />
          <View style={{ width: '100%', marginBottom: 30, alignItems: 'center' }}>
            <Text style={{ fontSize: 20, lineHeight: 28, ...FontSemiBold, color: ColorMap.light }}>{modalTitle}</Text>
          </View>

          {children}
        </View>

        {footer}

        <SafeAreaView />
      </View>
    </ModalBase>
  );
};

export default SwModal;
