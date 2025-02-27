import React from 'react';
import { StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import ModalBase from 'components/Modal/Base/ModalBase';
import {useSafeAreaInsets} from "react-native-safe-area-context";
interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  modalStyle?: StyleProp<any>;
  onModalHide?: () => void; // Auto trigger when close modal
  isFullHeight?: boolean;
}

const getSubWalletModalContainerStyle = (isFullHeight: boolean): StyleProp<any> => {
  return {
    marginTop: 'auto',
    backgroundColor: ColorMap.backgroundDefault,
    alignItems: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingHorizontal: 16,
    flex: isFullHeight ? 1 : undefined,
  };
};

const subWalletModalSeparator: StyleProp<any> = {
  width: 70,
  height: 5,
  borderRadius: 100,
  backgroundColor: ColorMap.modalSeparatorColor,
  marginBottom: 22,
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
  const insets = useSafeAreaInsets();
  return (
    <ModalBase
      isVisible={modalVisible}
      onModalHide={onModalHide} // Auto trigger when close modal
      swipeDirection={onChangeModalVisible ? 'down' : undefined}
      style={{ margin: 0 }}
      backdropColor={ColorMap.backgroundSecondary}
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
        <View style={{ width: '100%', paddingBottom: 16, alignItems: 'center', flex: isFullHeight ? 1 : undefined }}>
          <View style={subWalletModalSeparator} />

          {children}
        </View>
        <View style={{ paddingBottom: insets.bottom }} />
      </View>
    </ModalBase>
  );
};
