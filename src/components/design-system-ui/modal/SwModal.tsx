import React, { useEffect, useImperativeHandle, useState } from 'react';
import { Platform, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import ModalBase from 'components/Modal/Base/ModalBase';
import Typography from '../typography';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalBaseV2, { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { Portal } from '@gorhom/portal';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardVisible } from 'hooks/useKeyboardVisible';

export interface SWModalProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  modalStyle?: StyleProp<ViewStyle>;
  onModalHide?: () => void; // Auto trigger when close modal
  isFullHeight?: boolean;
  modalTitle?: string;
  titleTextAlign?: 'left' | 'center';
  contentContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  isUseForceHidden?: boolean;
  onBackButtonPress?: () => void;
  isUseModalV2?: boolean;
  setVisible: (arg: boolean) => void;
  modalBaseV2Ref?: React.RefObject<SWModalRefProps>;
  level?: number;
  isUseSafeAreaView?: boolean;
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
  marginBottom: 16,
  textAlign: 'center',
};

export type ModalRefProps = {
  height: number;
  onChangeHeight: (modalHeight: number) => void;
};

const SwModal = React.forwardRef<ModalRefProps, SWModalProps>(
  (
    {
      children,
      footer,
      modalVisible,
      onChangeModalVisible,
      modalStyle,
      modalTitle,
      onModalHide,
      isFullHeight = false,
      titleTextAlign = 'left',
      contentContainerStyle,
      titleStyle,
      isUseForceHidden,
      onBackButtonPress,
      isUseModalV2,
      setVisible,
      modalBaseV2Ref,
      level,
      isUseSafeAreaView = true,
    },
    ref,
  ) => {
    const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible();
    const theme = useSubWalletTheme().swThemes;
    const [contentHeight, setContentHeight] = useState<number>(400);
    const [childrenHeight, setChildrenHeight] = useState<number>(contentHeight);
    const insets = useSafeAreaInsets();

    useEffect(() => {
      if (isKeyboardVisible) {
        setChildrenHeight(keyboardHeight + contentHeight - insets.bottom);
      } else {
        setChildrenHeight(contentHeight);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentHeight, isKeyboardVisible]);

    useImperativeHandle(
      ref,
      () => ({
        height: contentHeight,
        onChangeHeight: setChildrenHeight,
      }),
      [contentHeight],
    );
    const renderTitle = () => {
      return (
        <>
          {modalTitle && (
            <View
              style={{
                width: '100%',
                marginBottom: 16,
                alignItems: titleTextAlign === 'left' ? 'flex-start' : 'center',
              }}>
              <Typography.Title level={4} style={[{ color: theme.colorTextLight1 }, titleStyle]}>
                {modalTitle}
              </Typography.Title>
            </View>
          )}
        </>
      );
    };
    return (
      <>
        {isUseModalV2 ? (
          <Portal>
            <ModalBaseV2
              isVisible={modalVisible}
              setVisible={setVisible}
              height={childrenHeight}
              ref={modalBaseV2Ref}
              isUseForceHidden={Platform.OS === 'android'}
              onChangeModalVisible={onChangeModalVisible}
              level={level}>
              <View
                style={{ paddingHorizontal: 16, paddingTop: 22 }}
                onLayout={event => {
                  let { height } = event.nativeEvent.layout;
                  !!height && setContentHeight(height + (Platform.OS === 'ios' ? 16 : -16));
                }}>
                {renderTitle()}
                {children}

                {footer}
                {isUseSafeAreaView && <SafeAreaView edges={['bottom']} style={{ marginBottom: theme.margin }} />}
              </View>
            </ModalBaseV2>
          </Portal>
        ) : (
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
            onBackButtonPress={onBackButtonPress}
            // useNativeDriver
            hideModalContentWhileAnimating
            isUseForceHidden={isUseForceHidden}
            propagateSwipe>
            <View style={[getSubWalletModalContainerStyle(!!isFullHeight), modalStyle]}>
              <View
                style={[
                  {
                    width: '100%',
                    paddingBottom: 16 + insets.bottom,
                    paddingHorizontal: 16,
                    alignItems: 'center',
                    flex: isFullHeight ? 1 : undefined,
                  },
                  contentContainerStyle,
                ]}>
                <View style={subWalletModalSeparator} />
                {renderTitle()}

                {children}
              </View>

              {footer}
              <SafeAreaView edges={['bottom']} />
            </View>
          </ModalBase>
        )}
      </>
    );
  },
);

export default SwModal;
