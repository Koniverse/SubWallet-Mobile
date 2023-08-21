import React from 'react';
import { Platform, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { ModalProps } from 'react-native-modal/dist/modal';
import ModalBase from 'components/design-system-ui/modal/ModalBase';
import { Portal } from '@gorhom/portal';
import ModalBaseV2, { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { deviceHeight } from 'constants/index';

interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  modalBaseV2Ref: React.RefObject<SWModalRefProps>;
  onChangeModalVisible?: () => void;
  modalStyle?: object;
  animationIn?: ModalProps['animationIn'];
  animationOut?: ModalProps['animationOut'];
  backdropColor?: string;
  onBackButtonPress?: () => void;
  isUseForceHidden?: boolean;
  isUseModalV2?: boolean;
  setVisible: (arg: boolean) => void;
  level?: number;
}

const subWalletModalContainer: StyleProp<any> = {
  flex: 1,
  backgroundColor: ColorMap.dark1,
  alignItems: 'center',
};

const SwFullSizeModal = ({
  children,
  modalVisible,
  modalStyle,
  animationIn,
  animationOut,
  backdropColor,
  isUseForceHidden,
  onBackButtonPress,
  isUseModalV2,
  setVisible,
  modalBaseV2Ref,
  level,
}: Props) => {
  return (
    <>
      {isUseModalV2 ? (
        <Portal>
          <ModalBaseV2
            level={level}
            ref={modalBaseV2Ref}
            isVisible={modalVisible}
            setVisible={setVisible}
            height={deviceHeight}
            isUseForceHidden={Platform.OS === 'android'}
            isFullHeight>
            <View style={[subWalletModalContainer, modalStyle]}>{children}</View>
          </ModalBaseV2>
        </Portal>
      ) : (
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
          isUseForceHidden={isUseForceHidden}
          propagateSwipe>
          <View style={[subWalletModalContainer, modalStyle]}>{children}</View>
        </ModalBase>
      )}
    </>
  );
};

export default SwFullSizeModal;
