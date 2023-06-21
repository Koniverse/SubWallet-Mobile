import React from 'react';
import { Platform, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { ModalProps } from 'react-native-modal/dist/modal';
import { STATUS_BAR_HEIGHT } from 'styles/sharedStyles';
import ModalBase from 'components/design-system-ui/modal/ModalBase';

interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  modalStyle?: object;
  animationIn?: ModalProps['animationIn'];
  animationOut?: ModalProps['animationOut'];
  backdropColor?: string;
  onBackButtonPress?: () => void;
}

const subWalletModalContainer: StyleProp<any> = {
  flex: 1,
  backgroundColor: ColorMap.dark1,
  alignItems: 'center',
  paddingTop: Platform.OS === 'android' ? STATUS_BAR_HEIGHT + 8 : 8,
};

const SwFullSizeModal = ({
  children,
  modalVisible,
  modalStyle,
  animationIn,
  animationOut,
  backdropColor,
  onBackButtonPress,
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
      onBackButtonPress={onBackButtonPress}
      propagateSwipe>
      <View style={[subWalletModalContainer, modalStyle]}>{children}</View>
    </ModalBase>
  );
};

export default SwFullSizeModal;
