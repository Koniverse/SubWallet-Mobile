import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { BarCodeReadEvent } from 'react-native-camera';
import ModalBase from 'components/Modal/Base/ModalBase';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { QrCodeScanner } from 'components/QrCodeScanner';

export interface AddressScannerProps {
  onPressCancel: () => void;
  onChangeAddress: (data: string) => void;
  qrModalVisible: boolean;
  error?: string;
  isShowError?: boolean;
}

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

  const onPressLibraryBtn = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    RNQRGenerator.detect({
      uri: result.assets && result.assets[0]?.uri,
    })
      .then(response => {
        onChangeAddress(response.values[0]);
        !isShowError && onPressCancel();
      })
      .catch(err => console.log(err));
  };

  return (
    <ModalBase isVisible={qrModalVisible} style={{ flex: 1, width: '100%', margin: 0 }}>
      <SafeAreaView style={ScannerStyles.SafeAreaStyle} />
      <StatusBar barStyle={STATUS_BAR_LIGHT_CONTENT} backgroundColor={'transparent'} translucent={true} />
      <QrCodeScanner
        onPressCancel={onPressCancel}
        onPressLibraryBtn={onPressLibraryBtn}
        onSuccess={onSuccess}
        error={error}
      />
    </ModalBase>
  );
};
