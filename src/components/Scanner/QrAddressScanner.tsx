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
import { rectDimensions } from 'constants/scanner';
import { BarCodeReadEvent } from 'react-native-camera';
import { getFunctionScan } from 'utils/scanner/attach';
import ModalBase from 'components/Modal/Base/ModalBase';
import { IconButton } from 'components/IconButton';
import { CaretLeft, ImageSquare } from 'phosphor-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { updatePreventLock } from 'stores/MobileSettings';
import { useDispatch } from 'react-redux';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';

interface Props {
  visible: boolean;
  onHideModal: () => void;
  onSuccess: (data: QrAccount) => void;
  type: SCAN_TYPE.QR_SIGNER | SCAN_TYPE.SECRET;
}

const CancelButtonStyle: StyleProp<ViewStyle> = {
  position: 'absolute',
  left: 16,
  zIndex: 10,
};

const LibraryButtonStyle: StyleProp<ViewStyle> = {
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

const QrAddressScanner = ({ visible, onHideModal, onSuccess, type }: Props) => {
  const theme = useSubWalletTheme().swThemes;
  const [error, setError] = useState<string>('');
  const dispatch = useDispatch();
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

  const onPressLibraryBtn = async () => {
    dispatch(updatePreventLock(true));
    const result = await launchImageLibrary({ mediaType: 'photo' });

    RNQRGenerator.detect({
      uri: result.assets && result.assets[0]?.uri,
      base64: result.assets && result.assets[0].base64,
    })
      .then(response => {
        const funcRead = getFunctionScan(type);
        const qrAccount = funcRead(response.values[0]);

        if (!qrAccount) {
          setError(i18n.warningMessage.invalidQRCode);
          return;
        }

        setError('');
        onSuccess(qrAccount);
        onHideModal();
        dispatch(updatePreventLock(false));
      })
      .catch(e => setError((e as Error).message));
  };

  useEffect(() => {
    if (!visible) {
      setError('');
    }
  }, [visible]);

  return (
    <ModalBase isVisible={visible} style={{ flex: 1, width: '100%', margin: 0 }}>
      <SafeAreaView style={ScannerStyles.SafeAreaStyle} />
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={theme.colorBgSecondary} translucent={true} />
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
              <View style={[ScannerStyles.HeaderStyle, { backgroundColor: theme.colorBgSecondary }]}>
                <Text style={ScannerStyles.HeaderTitleTextStyle}>{i18n.title.scanQrCode}</Text>
                <IconButton icon={CaretLeft} style={CancelButtonStyle} onPress={onHideModal} />
                <IconButton icon={ImageSquare} style={LibraryButtonStyle} onPress={onPressLibraryBtn} />
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
              <View style={BottomSubContentStyle} />
            </View>
          </View>
        }
      />
    </ModalBase>
  );
};

export default React.memo(QrAddressScanner);
