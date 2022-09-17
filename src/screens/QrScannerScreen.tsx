import React from 'react';
import { StatusBar, StyleProp, TouchableOpacity, View } from 'react-native';
import Text from 'components/Text';
import { FontSemiBold, sharedStyles, STATUS_BAR_HEIGHT, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BUTTON_ACTIVE_OPACITY, deviceHeight, deviceWidth } from '../constant';
import { X } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { BarCodeReadEvent } from 'react-native-camera';
import i18n from 'utils/i18n/i18n';
import { getNetworkLogo } from 'utils/index';
import Modal from 'components/Modal';

const overlayColor = 'rgba(34, 34, 34, 0.5)'; // this gives us a black color with a 50% transparency

const rectDimensions = deviceWidth * 0.64; // this is equivalent to 255 from a 393 device width
const rectBorderWidth = deviceWidth * 0.005; // this is equivalent to 2 from a 393 device width
const rectBorderColor = 'transparent';
const topOverlayHeight = (deviceHeight - rectDimensions) * 0.4;
const bottomOverlayHeight = (deviceHeight - rectDimensions) * 0.65;

const containerStyle: StyleProp<any> = {
  margin: 0,
  padding: 0,
  backgroundColor: 'transparent',
};

const cameraStyle: StyleProp<any> = {
  height: deviceHeight,
};

const rectangleContainer: StyleProp<any> = {
  flex: 1,
  alignItems: 'center',
  backgroundColor: overlayColor,
};

const topOverlay: StyleProp<any> = {
  // flex: 1,
  height: topOverlayHeight,
  width: deviceWidth,
  backgroundColor: overlayColor,
  paddingTop: STATUS_BAR_HEIGHT + 12.5,
};

const bottomOverlay: StyleProp<any> = {
  flex: 1,
  height: bottomOverlayHeight,
  width: deviceWidth,
  backgroundColor: overlayColor,
  justifyContent: 'center',
  alignItems: 'center',
};

const centerText: StyleProp<any> = {
  ...sharedStyles.mediumText,
  color: ColorMap.light,
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  ...FontSemiBold,
};

const leftAndRightOverlay: StyleProp<any> = {
  height: rectDimensions,
  width: deviceWidth,
  backgroundColor: overlayColor,
};

const rectangle: StyleProp<any> = {
  height: rectDimensions,
  width: rectDimensions,
  borderWidth: rectBorderWidth,
  borderColor: rectBorderColor,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
};

const headerStyle: StyleProp<any> = {
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
};

const cancelButtonStyle: StyleProp<any> = {
  position: 'absolute',
  right: 16,
  zIndex: 10,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

interface Props {
  onPressCancel: () => void;
  onChangeAddress: (data: string) => void;
  qrModalVisible: boolean;
  networkKey?: string;
  token?: string;
}

export const QrScannerScreen = ({ onPressCancel, onChangeAddress, qrModalVisible, networkKey, token }: Props) => {
  const onSuccess = (e: BarCodeReadEvent) => {
    try {
      onChangeAddress(e.data);
      onPressCancel();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal isVisible={qrModalVisible} style={{ flex: 1, width: '100%', margin: 0 }}>
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={overlayColor} translucent={true} />
      <QRCodeScanner
        reactivate={true}
        reactivateTimeout={5000}
        showMarker={true}
        onRead={e => {
          onSuccess(e);
        }}
        containerStyle={containerStyle}
        cameraStyle={cameraStyle}
        topViewStyle={containerStyle}
        customMarker={
          <View style={rectangleContainer}>
            <View style={topOverlay}>
              <View style={headerStyle}>
                <Text style={{ ...sharedStyles.mediumText, color: ColorMap.light, ...FontSemiBold }}>Scan QR Code</Text>
                <TouchableOpacity
                  activeOpacity={BUTTON_ACTIVE_OPACITY}
                  style={cancelButtonStyle}
                  onPress={onPressCancel}>
                  <X size={20} weight={'bold'} color={'#FFF'} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: 'transparent', height: rectDimensions }}>
              <View style={leftAndRightOverlay} />

              <View style={rectangle}>
                <BarcodeFinder
                  width={rectDimensions}
                  height={rectDimensions}
                  borderColor={ColorMap.light}
                  borderWidth={2}
                />
              </View>

              <View style={leftAndRightOverlay} />
            </View>
            <View style={bottomOverlay}>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 22 }}>
                {networkKey && (
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: ColorMap.secondary,
                      marginBottom: 16,
                    }}>
                    {getNetworkLogo(networkKey, 34)}
                  </View>
                )}

                {token && (
                  <Text style={centerText}>{`${i18n.common.scan} ${token} ${i18n.common.toAddressToSendFunds}`}</Text>
                )}
              </View>
            </View>
          </View>
        }
      />
    </Modal>
  );
};
