import React, { useRef } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { QrCodeScanner } from 'components/QrCodeScanner';
import { SwFullSizeModal } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { View } from 'react-native';

export interface AddressScannerProps {
  onPressCancel: () => void;
  onChangeAddress: (data: string) => void;
  qrModalVisible: boolean;
  setQrModalVisible: (value: boolean) => void;
  error?: string;
  isShowError?: boolean;
  onLoadingStatusChange?: (loading: boolean) => void;
}

export const AddressScanner = ({
  onPressCancel,
  onChangeAddress,
  qrModalVisible,
  setQrModalVisible,
  error,
  isShowError = false,
  onLoadingStatusChange,
}: AddressScannerProps) => {
  const addressScannerRef = useRef<SWModalRefProps>(null);
  const onSuccess = (data: string) => {
    try {
      onChangeAddress(data);
      !isShowError && onPressCancel();
    } catch (err) {
      console.log(err);
    }
  };

  const onPressLibraryBtn = async () => {
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7, maxWidth: 1024, maxHeight: 1024 });
      if (result.didCancel || !result.assets?.[0]?.uri) {
        return;
      }

      onLoadingStatusChange?.(true);
      setQrModalVisible(false);

      const response = await RNQRGenerator.detect({
        uri: result.assets[0].uri,
      });

      if (!response.values?.length) {
        return;
      }

      onChangeAddress(response.values[0]);
    } catch (err) {
      console.log(err);
    } finally {
      onLoadingStatusChange?.(false);
    }
  };

  return (
    <SwFullSizeModal
      isUseModalV2
      hideWhenCloseApp={false}
      modalVisible={qrModalVisible}
      setVisible={setQrModalVisible}
      modalBaseV2Ref={addressScannerRef}>
      <View style={{ width: '100%', height: '100%' }}>
        <QrCodeScanner
          onPressCancel={onPressCancel}
          onPressLibraryBtn={onPressLibraryBtn}
          onSuccess={onSuccess}
          error={error}
        />
      </View>

    </SwFullSizeModal>
  );
};
