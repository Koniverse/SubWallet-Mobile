import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import Text from 'components/Text';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { X } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { BarCodeReadEvent } from 'react-native-camera';
import i18n from 'utils/i18n/i18n';
import ModalBase from 'components/Modal/Base/ModalBase';
import { overlayColor, rectDimensions } from 'constants/scanner';
import { IconButton } from 'components/IconButton';
import { Warning } from 'components/Warning';

export interface AddressScannerProps {
  onPressCancel: () => void;
  onChangeAddress: (data: string) => void;
  qrModalVisible: boolean;
  error?: string;
  isShowError?: boolean;
}

const CancelButtonStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  right: 16,
  zIndex: 10,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

const BottomSubContentStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginHorizontal: 16,
  flex: 1,
};

export const AddressScanner = ({
  onPressCancel,
  onChangeAddress,
  qrModalVisible,
  error,
  isShowError = false,
}: AddressScannerProps) => {
  const onSuccess = (e: BarCodeReadEvent) => {
    try {
      onChangeAddress(e.data);
      !isShowError && onPressCancel();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <ModalBase isVisible={qrModalVisible} style={{ flex: 1, width: '100%', margin: 0 }}>
      <SafeAreaView style={ScannerStyles.SafeAreaStyle} />
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={overlayColor} translucent={true} />
      <QRCodeScanner
        reactivate={true}
        reactivateTimeout={5000}
        showMarker={true}
        onRead={e => {
          onSuccess(e);
        }}
        containerStyle={ScannerStyles.ContainerStyle}
        cameraStyle={ScannerStyles.CameraStyle}
        topViewStyle={ScannerStyles.ContainerStyle}
        customMarker={
          <View style={ScannerStyles.RectangleContainerStyle}>
            <View style={ScannerStyles.TopOverlayStyle}>
              <View style={ScannerStyles.HeaderStyle}>
                <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.scanQrCode}</Text>
                <IconButton icon={X} style={CancelButtonStyle} onPress={onPressCancel} />
              </View>
            </View>
            <View style={ScannerStyles.CenterOverlayStyle}>
              <View style={ScannerStyles.LeftAndRightOverlayStyle} />

              <View style={ScannerStyles.RectangleStyle}>
                <BarcodeFinder
                  width={rectDimensions}
                  height={rectDimensions}
                  borderColor={ColorMap.light}
                  borderWidth={2}
                />
              </View>

              <View style={ScannerStyles.LeftAndRightOverlayStyle} />
            </View>
            <View style={ScannerStyles.BottomOverlayStyle}>
              <View style={BottomSubContentStyle}>{!!error && <Warning message={error} isDanger />}</View>
              <View style={BottomSubContentStyle} />
            </View>
          </View>
        }
      />
    </ModalBase>
  );
};
