import { SubWalletModal } from 'components/Modal/Base/SubWalletModal';
import Text from 'components/Text';
import { Warning } from 'components/Warning';
import { DEVICE } from 'constants/index';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { ColorMap } from 'styles/color';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { QrAccount } from 'types/account/qr';
import i18n from 'utils/i18n/i18n';
import { overlayColor, rectDimensions } from 'constants/scanner';
import { BarCodeReadEvent } from 'react-native-camera';
import { qrSignerScan } from 'utils/scanner';

interface Props {
  visible: boolean;
  onHideModal: () => void;
  onSuccess: (data: QrAccount) => void;
}

const WrapperContainerStyle: StyleProp<ViewStyle> = {
  height: DEVICE.height - 60,
  zIndex: -1,
};

const BottomSubContentStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
  justifyContent: 'flex-end',
  marginHorizontal: 16,
  flex: 1,
};

const BottomContentStyle: StyleProp<ViewStyle> = {
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
};

const QrAddressScanner = ({ visible, onHideModal, onSuccess }: Props) => {
  const [error, setError] = useState<string>('');

  const handleRead = useCallback(
    (event: BarCodeReadEvent) => {
      try {
        const qrAccount = qrSignerScan(event.data);

        if (!qrAccount) {
          setError(i18n.warningMessage.invalidQRCode);
          return;
        }

        setError('');
        onSuccess(qrAccount);
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [onSuccess],
  );

  useEffect(() => {
    if (!visible) {
      setError('');
    }
  }, [visible]);

  return (
    <SubWalletModal modalVisible={visible} onModalHide={onHideModal} onChangeModalVisible={onHideModal}>
      <View style={WrapperContainerStyle}>
        <SafeAreaView style={ScannerStyles.SafeAreaStyle} />
        <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={overlayColor} translucent={true} />
        <QRCodeScanner
          reactivate={true}
          reactivateTimeout={5000}
          showMarker={true}
          onRead={handleRead}
          containerStyle={ScannerStyles.ContainerStyle}
          cameraStyle={ScannerStyles.CameraStyle}
          topViewStyle={ScannerStyles.ContainerStyle}
          customMarker={
            <View style={ScannerStyles.RectangleContainerStyle}>
              <View style={ScannerStyles.TopOverlayStyle}>
                <View style={ScannerStyles.HeaderStyle}>
                  <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.scanAddress}</Text>
                </View>
              </View>
              <View style={ScannerStyles.CenterOverlayStyle}>
                <View style={ScannerStyles.LeftAndRightOverlayStyle} />

                <View style={[ScannerStyles.RectangleStyle]}>
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
                <View style={BottomContentStyle}>
                  <Text style={ScannerStyles.CenterTextStyle}>{i18n.common.scanFromHardwareWallet}</Text>
                </View>
                <View style={BottomSubContentStyle} />
              </View>
            </View>
          }
        />
      </View>
    </SubWalletModal>
  );
};

export default React.memo(QrAddressScanner);
