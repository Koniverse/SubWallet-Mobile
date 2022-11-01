import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';
import Text from 'components/Text';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BUTTON_ACTIVE_OPACITY } from 'constants/index';
import { X } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { BarCodeReadEvent } from 'react-native-camera';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo } from 'utils/index';
import ModalBase from 'components/Modal/Base/ModalBase';
import { overlayColor, rectDimensions } from 'constants/scanner';

interface Props {
  onPressCancel: () => void;
  onChangeAddress: (data: string) => void;
  qrModalVisible: boolean;
  networkKey?: string;
  token?: string;
  scanMessage?: string;
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

const BottomContentStyle: StyleProp<ViewStyle> = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: 22,
};

export const AddressScanner = ({
  onPressCancel,
  onChangeAddress,
  qrModalVisible,
  networkKey,
  token,
  scanMessage = i18n.common.toSendFund,
}: Props) => {
  const onSuccess = (e: BarCodeReadEvent) => {
    try {
      onChangeAddress(e.data);
      onPressCancel();
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
                <TouchableOpacity
                  activeOpacity={BUTTON_ACTIVE_OPACITY}
                  style={CancelButtonStyle}
                  onPress={onPressCancel}>
                  <X size={20} weight={'bold'} color={'#FFF'} />
                </TouchableOpacity>
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
              <View style={BottomContentStyle}>
                {networkKey && <View style={ScannerStyles.LogoContainerStyle}>{getNetworkLogo(networkKey, 34)}</View>}

                {token && (
                  <Text
                    style={
                      ScannerStyles.CenterTextStyle
                    }>{`${i18n.common.scan} ${token} ${i18n.common.address} ${scanMessage}`}</Text>
                )}
              </View>
            </View>
          </View>
        }
      />
    </ModalBase>
  );
};
