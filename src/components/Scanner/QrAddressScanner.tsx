import Text from 'components/Text';
import { Warning } from 'components/Warning';
import { SCAN_TYPE } from 'constants/qr';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleProp, View, ViewStyle } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BarcodeFinder } from 'screens/Shared/BarcodeFinder';
import { ColorMap } from 'styles/color';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { QrAccount } from 'types/qr/attach';
import i18n from 'utils/i18n/i18n';
import { overlayColor, rectDimensions } from 'constants/scanner';
import { BarCodeReadEvent } from 'react-native-camera';
import { getFunctionScan } from 'utils/scanner/attach';
import ModalBase from 'components/Modal/Base/ModalBase';
import { IconButton } from 'components/IconButton';
import { X } from 'phosphor-react-native';

interface Props {
  visible: boolean;
  onHideModal: () => void;
  onSuccess: (data: QrAccount) => void;
  type: SCAN_TYPE.QR_SIGNER | SCAN_TYPE.SECRET;
}

const CancelButtonStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  right: 16,
  zIndex: 10,
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

const QrAddressScanner = ({ visible, onHideModal, onSuccess, type }: Props) => {
  const [error, setError] = useState<string>('');

  const handleRead = useCallback(
    (event: BarCodeReadEvent) => {
      try {
        const funcRead = getFunctionScan(type);
        const qrAccount = funcRead(event.data);

        if (!qrAccount) {
          setError(i18n.warningMessage.invalidQRCode);
          return;
        }

        setError('');
        onSuccess(qrAccount);
        onHideModal();
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [onHideModal, onSuccess, type],
  );

  useEffect(() => {
    if (!visible) {
      setError('');
    }
  }, [visible]);

  return (
    <ModalBase isVisible={visible} style={{ flex: 1, width: '100%', margin: 0 }}>
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
                <IconButton icon={X} style={CancelButtonStyle} onPress={onHideModal} />
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
                <Text style={ScannerStyles.CenterTextStyle}>
                  {type === SCAN_TYPE.QR_SIGNER && i18n.common.scanFromHardwareWallet}
                  {type === SCAN_TYPE.SECRET && i18n.common.scanFromWallet}
                </Text>
              </View>
              <View style={BottomSubContentStyle} />
            </View>
          </View>
        }
      />
    </ModalBase>
  );
};

export default React.memo(QrAddressScanner);
