import React, { useEffect, useRef, useState } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { QrCodeScanner } from 'components/QrCodeScanner';
import { SwFullSizeModal } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { View } from 'react-native';
import { AutoLockState } from 'utils/autoLock';
import i18n from 'utils/i18n/i18n';

export interface AddressScannerProps {
  onPressCancel: () => void;
  onChangeAddress: (data: string) => void;
  qrModalVisible: boolean;
  setQrModalVisible: (value: boolean) => void;
  error?: string;
  isShowError?: boolean;
  onLoadingStatusChange?: (loading: boolean) => void;
  // Shown in the scanner when a photo picked from the library has no readable QR code.
  libraryErrorMessage?: string;
}

export const AddressScanner = ({
  onPressCancel,
  onChangeAddress,
  qrModalVisible,
  setQrModalVisible,
  error,
  isShowError = false,
  onLoadingStatusChange,
  libraryErrorMessage = i18n.errorMessage.isNotAnAddress,
}: AddressScannerProps) => {
  const addressScannerRef = useRef<SWModalRefProps>(null);
  const visibleRef = useRef(qrModalVisible);
  const [libraryError, setLibraryError] = useState<string | undefined>(undefined);
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);

  useEffect(() => {
    visibleRef.current = qrModalVisible;
    setLibraryError(undefined);
  }, [qrModalVisible]);

  const onSuccess = (data: string) => {
    setLibraryError(undefined);

    try {
      onChangeAddress(data);
      !isShowError && onPressCancel();
    } catch (err) {
      console.log(err);
    }
  };

  // The scanner stays open while the photo is decoded, so an unreadable photo (or a QR
  // code the caller rejects through `error`) is reported right here instead of closing
  // with nothing to show.
  const onPressLibraryBtn = async () => {
    let uri: string | undefined;

    try {
      // The gallery sends the app to the background, which would otherwise trip the auto-lock
      // (always / biometric / elapsed timeout) and drop the unlock screen under this modal.
      // Every other system picker in the app guards the same way - see InputFile.
      AutoLockState.isPreventAutoLock = true;

      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7, maxWidth: 1024, maxHeight: 1024 });

      uri = result.didCancel ? undefined : result.assets?.[0]?.uri;
    } catch (err) {
      console.log(err);
    } finally {
      AutoLockState.isPreventAutoLock = false;
    }

    if (!uri) {
      return;
    }

    setLibraryError(undefined);
    setIsLibraryLoading(true);
    onLoadingStatusChange?.(true);

    try {
      const response = await RNQRGenerator.detect({ uri });
      const value = response.values?.[0];

      // The scanner was closed while the photo was being decoded: nothing to report to.
      if (!visibleRef.current) {
        return;
      }

      if (!value) {
        setLibraryError(libraryErrorMessage);

        return;
      }

      onSuccess(value);
    } catch (err) {
      console.log(err);
      visibleRef.current && setLibraryError(libraryErrorMessage);
    } finally {
      setIsLibraryLoading(false);
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
          error={error || libraryError}
          isLibraryLoading={isLibraryLoading}
        />
      </View>
    </SwFullSizeModal>
  );
};
