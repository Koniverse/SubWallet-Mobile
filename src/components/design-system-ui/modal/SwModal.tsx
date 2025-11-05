import React, { useEffect, useImperativeHandle, useState } from 'react';
import {
  AppState,
  BackHandler,
  DeviceEventEmitter,
  Platform,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import ModalBase from 'components/Modal/Base/ModalBase';
import Typography from '../typography';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import ModalBaseV2, { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { Portal } from '@gorhom/portal';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardVisible } from 'hooks/useKeyboardVisible';
import Button from '../button';
import { Icon } from 'components/design-system-ui';
import { CaretLeft, Gear } from 'phosphor-react-native';

export interface SWModalProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  modalVisible: boolean;
  onChangeModalVisible?: () => void;
  onBackdropPress?: () => void;
  modalStyle?: StyleProp<ViewStyle>;
  onModalHide?: () => void; // Auto trigger when close modal
  isFullHeight?: boolean;
  isAllowSwipeDown?: boolean;
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
  disabledOnPressBackDrop?: boolean;
  renderHeader?: React.ReactNode;
  hideWhenCloseApp?: boolean;
  isShowLeftBtn?: boolean;
  isShowRightBtn?: boolean;
  onPressLeftBtn?: () => void;
  onPressRightBtn?: () => void;
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
      onBackdropPress,
      isAllowSwipeDown,
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
      renderHeader,
      disabledOnPressBackDrop,
      hideWhenCloseApp = true,
      isShowLeftBtn,
      isShowRightBtn,
      onPressLeftBtn,
      onPressRightBtn,
    },
    ref,
  ) => {
    const { isKeyboardVisible, keyboardHeight } = useKeyboardVisible();
    const theme = useSubWalletTheme().swThemes;
    const [contentHeight, setContentHeight] = useState<number>(0);
    const [childrenHeight, setChildrenHeight] = useState<number>(contentHeight);
    const insets = useSafeAreaInsets();

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

    useEffect(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (modalVisible) {
          if (onBackButtonPress) {
            onBackButtonPress();
          } else {
            DeviceEventEmitter.emit('closeModal');
          }

          return true;
        } else {
          return false;
        }
      });
      return () => backHandler.remove();
    }, [modalVisible, onBackButtonPress]);

    useEffect(() => {
      if (isKeyboardVisible) {
        setChildrenHeight(keyboardHeight + contentHeight - (Platform.OS === 'ios' ? insets.bottom : 0));
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
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.margin }}>
          {isShowLeftBtn && (
            <Button
              style={{ position: 'absolute', left: 0 }}
              size={'xs'}
              icon={<Icon phosphorIcon={CaretLeft} />}
              type={'ghost'}
              onPress={onPressLeftBtn}
            />
          )}
          {modalTitle && (
            <View
              style={{
                width: '100%',
                alignItems: titleTextAlign === 'left' ? 'flex-start' : 'center',
                flex: 1,
              }}>
              <Typography.Title level={4} style={[{ color: theme.colorTextLight1 }, titleStyle]}>
                {modalTitle}
              </Typography.Title>
            </View>
          )}
          {isShowRightBtn && (
            <Button
              style={{ position: 'absolute', right: 0 }}
              size={'xs'}
              icon={<Icon phosphorIcon={Gear} />}
              type={'ghost'}
              onPress={onPressRightBtn}
            />
          )}
        </View>
      );
    };
    return (
      <>
        {isUseModalV2 ? (
          <Portal hostName="SimpleModalHost">
            <ModalBaseV2
              isVisible={modalVisible}
              setVisible={setVisible}
              height={childrenHeight}
              ref={modalBaseV2Ref}
              disabledOnPressBackDrop={disabledOnPressBackDrop}
              isUseForceHidden={isUseForceHidden === undefined ? Platform.OS === 'android' : isUseForceHidden}
              onChangeModalVisible={onChangeModalVisible}
              isAllowSwipeDown={isAllowSwipeDown}
              onBackButtonPress={onBackButtonPress}
              level={level}>
              <View
                style={{ paddingHorizontal: 16, paddingTop: 22 }}
                onLayout={event => {
                  let { height } = event.nativeEvent.layout;
                  !!height && setContentHeight(height);
                }}>
                {renderHeader ? renderHeader : renderTitle()}
                {children}

                {footer}
                {isUseSafeAreaView && (
                  <SafeAreaView
                    edges={['bottom']}
                    style={{
                      marginBottom: Platform.select({ ios: 30, android: Number(Platform.Version) > 34 ? 30 : 0 }),
                    }}
                  />
                )}
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
            onBackdropPress={onBackdropPress || onChangeModalVisible}
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
                    paddingBottom: 16 + (Platform.OS === 'android' ? 0 : insets.bottom),
                    paddingHorizontal: 16,
                    alignItems: 'center',
                    flex: isFullHeight ? 1 : undefined,
                  },
                  contentContainerStyle,
                ]}>
                <View style={subWalletModalSeparator} />
                {renderHeader ? renderHeader : renderTitle()}

                {children}
              </View>

              {footer}
            </View>
          </ModalBase>
        )}
      </>
    );
  },
);

export default SwModal;
