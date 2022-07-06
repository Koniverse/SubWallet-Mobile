import React from 'react';
import { StatusBar, StyleProp, Text, TouchableOpacity, View } from 'react-native';
import { sharedStyles, STATUS_BAR_HEIGHT, STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BUTTON_ACTIVE_OPACITY, deviceHeight, deviceWidth, statusBarHeight } from '../constant';
import { X } from 'phosphor-react-native';
import { ColorMap } from 'styles/color';
import * as Animatable from 'react-native-animatable';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { BarCodeReadEvent } from 'react-native-camera';
import i18n from 'utils/i18n/i18n';
import Modal from 'react-native-modal';

const overlayColor = 'rgba(0,0,0,0.5)'; // this gives us a black color with a 50% transparency

const rectDimensions = deviceWidth * 0.65; // this is equivalent to 255 from a 393 device width
const rectBorderWidth = deviceWidth * 0.005; // this is equivalent to 2 from a 393 device width
const rectBorderColor = 'transparent';

const scanBarWidth = deviceWidth * 0.64; // this is equivalent to 180 from a 393 device width
const scanBarHeight = deviceWidth * 0.005; //this is equivalent to 1 from a 393 device width

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
  height: deviceWidth * 0.7,
  width: deviceWidth,
  backgroundColor: overlayColor,
  paddingTop: statusBarHeight,
  position: 'relative',
};

const centerText: StyleProp<any> = {
  ...sharedStyles.mainText,
  color: ColorMap.light,
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
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

const scanBar: StyleProp<any> = {
  width: scanBarWidth,
  height: scanBarHeight,
  backgroundColor: ColorMap.primary,
};

interface Props {
  onPressCancel: () => void;
  onChangeAddress: (data: string) => void;
  qrModalVisible: boolean;
}

export const QrScannerScreen = ({ onPressCancel, onChangeAddress, qrModalVisible }: Props) => {
  const makeSlideOutTranslation = (translationType: string, fromValue: number) => {
    return {
      from: {
        [translationType]: deviceWidth * 0.32,
      },
      to: {
        [translationType]: fromValue,
      },
    };
  };

  const onSuccess = (e: BarCodeReadEvent) => {
    try {
      onChangeAddress(e.data);
      onPressCancel();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Modal isVisible={qrModalVisible} hideModalContentWhileAnimating style={{ flex: 1, width: '100%', margin: 0 }}>
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={'transparent'} translucent={true} />
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
              <TouchableOpacity
                activeOpacity={BUTTON_ACTIVE_OPACITY}
                style={{ position: 'absolute', left: 16, top: STATUS_BAR_HEIGHT + 20, zIndex: 10 }}
                onPress={onPressCancel}>
                <X size={20} weight={'bold'} color={'#FFF'} />
              </TouchableOpacity>

              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: 22 }}>
                <Text style={centerText}>{i18n.warningMessage.setQRCodeInTheCenterOfTheSquare}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: 'transparent', height: rectDimensions }}>
              <View style={leftAndRightOverlay} />

              <View style={rectangle}>
                <BarcodeFinder
                  width={rectDimensions}
                  height={rectDimensions}
                  borderColor={ColorMap.primary}
                  borderWidth={2}
                />
                <Animatable.View
                  style={scanBar}
                  direction="alternate-reverse"
                  iterationCount="infinite"
                  duration={2000}
                  easing="linear"
                  animation={makeSlideOutTranslation('translateY', deviceWidth * -0.32)}
                />
              </View>

              <View style={leftAndRightOverlay} />
            </View>
          </View>
        }
      />
    </Modal>
  );
};
