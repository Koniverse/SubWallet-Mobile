import React, { useEffect } from 'react';
import { AppState, BackHandler, DeviceEventEmitter, Platform, StyleProp, View } from 'react-native';
import { ColorMap } from 'styles/color';
import { ModalProps } from 'react-native-modal/dist/modal';
import ModalBase from 'components/design-system-ui/modal/ModalBase';
import { Portal } from '@gorhom/portal';
import ModalBaseV2, { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { deviceHeight } from 'constants/index';
import useAppLock from 'hooks/useAppLock';
import { noop } from 'utils/function';

interface Props {
  children: React.ReactNode;
  modalVisible: boolean;
  modalBaseV2Ref: React.RefObject<SWModalRefProps | null>;
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
  hideWhenCloseApp?: boolean;
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
  onChangeModalVisible,
  isUseModalV2,
  setVisible,
  modalBaseV2Ref,
  level,
  hideWhenCloseApp = true,
}: Props) => {
  const { isLocked } = useAppLock();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // While the app is locked this modal is force-hidden; swallowing back here would leave the
      // unlock screen with a dead back button.
      if (modalVisible && !isLocked) {
        DeviceEventEmitter.emit('closeModal');
        return true;
      } else {
        return false;
      }
    });
    return () => backHandler.remove();
  }, [isLocked, modalVisible]);

  useEffect(() => {
    const unsubscribe = AppState.addEventListener('change', state => {
      if (state === 'background' && hideWhenCloseApp) {
        setVisible(false);
      }
    });

    return () => {
      unsubscribe.remove();
    };
  }, [hideWhenCloseApp, setVisible]);

  return (
    <>
      {isUseModalV2 ? (
        <Portal hostName="SimpleModalHost">
          <ModalBaseV2
            onChangeModalVisible={onChangeModalVisible}
            level={level}
            ref={modalBaseV2Ref}
            isVisible={modalVisible}
            setVisible={setVisible}
            height={deviceHeight}
            onBackButtonPress={onBackButtonPress}
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
          backdropColor={backdropColor || ''}
          hideModalContentWhileAnimating
          statusBarTranslucent
          onBackButtonPress={onBackButtonPress || noop}
          isUseForceHidden={isUseForceHidden}
          propagateSwipe>
          <View style={[subWalletModalContainer, modalStyle]}>{children}</View>
        </ModalBase>
      )}
    </>
  );
};

export default SwFullSizeModal;
