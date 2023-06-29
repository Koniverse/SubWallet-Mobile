import React from 'react';
import { SafeAreaView, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import ModalBase from 'components/Modal/Base/ModalBase';
import Typography from '../typography';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

export interface SWModalProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  modalStyle?: StyleProp<ViewStyle>;
  onModalHide?: () => void; // Auto trigger when close modal
  isFullHeight?: boolean;
  modalTitle?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
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
  contentContainerStyle,
  titleStyle,
}: SWModalProps) => {
  const theme = useSubWalletTheme().swThemes;
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
          style={[
            {
              width: '100%',
              paddingBottom: 16,
              paddingHorizontal: 16,
              alignItems: 'center',
              flex: isFullHeight ? 1 : undefined,
            },
            contentContainerStyle,
          ]}>
          <View style={subWalletModalSeparator} />
          {modalTitle && (
            <Typography.Title
              level={4}
              style={[{ color: theme.colorTextLight1, marginBottom: theme.marginLG }, titleStyle]}>
              {modalTitle}
            </Typography.Title>
          )}

          {children}
        </View>

        {footer}

        <SafeAreaView />
      </View>
    </ModalBase>
  );
};

export default SwModal;
