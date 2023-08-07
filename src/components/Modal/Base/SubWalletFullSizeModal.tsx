import React from 'react';
import { Platform, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { ModalProps } from 'react-native-modal/dist/modal';
import ModalBase from 'components/Modal/Base/ModalBase';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';

interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  modalStyle?: object;
  animationIn?: ModalProps['animationIn'];
  animationOut?: ModalProps['animationOut'];
  backdropColor?: string;
}

const subWalletModalContainer: StyleProp<any> = {
  flex: 1,
  backgroundColor: ColorMap.dark1,
  alignItems: 'center',
  paddingTop: Platform.OS === 'android' ? STATUS_BAR_HEIGHT + 8 : 8,
};

export const SubWalletFullSizeModal = ({
  children,
  modalVisible,
  modalStyle,
  animationIn,
  animationOut,
  backdropColor,
}: Props) => {
  return (
    <ModalBase
      isVisible={modalVisible}
      style={{ margin: 0, zIndex: 10000 }}
      animationIn={animationIn || 'slideInUp'}
      animationOut={animationOut || 'slideOutDown'}
      useNativeDriver
      backdropColor={backdropColor}
      hideModalContentWhileAnimating
      statusBarTranslucent
      propagateSwipe>
      <View style={[subWalletModalContainer, modalStyle]}>{children}</View>
    </ModalBase>
  );
};
