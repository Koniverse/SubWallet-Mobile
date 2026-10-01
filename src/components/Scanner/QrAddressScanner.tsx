import { SCAN_TYPE } from 'constants/qr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { QrAccount } from 'types/qr/attach';
import i18n from 'utils/i18n/i18n';
import { getFunctionScan } from 'utils/scanner/attach';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { updatePreventLock } from 'stores/MobileSettings';
import { useDispatch } from 'react-redux';
import { SwFullSizeModal } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { AutoLockState } from 'utils/autoLock';
import { getDevMode } from 'utils/storage';
import { QrCodeScanner } from 'components/QrCodeScanner';

interface Props {
  visible: boolean;
  onHideModal: () => void;
  onSuccess: (data: QrAccount) => void;
  type: SCAN_TYPE.QR_SIGNER | SCAN_TYPE.SECRET;
  setQrModalVisible: (value: boolean) => void;
}

const QrAddressScanner = ({ visible, onHideModal, onSuccess, type, setQrModalVisible }: Props) => {
  const [error, setError] = useState<string>('');
  const [isLibraryLoading, setIsLibraryLoading] = useState(false);
  const addressScannerRef = useRef<SWModalRefProps>(null);
  const visibleRef = useRef(visible);
  const isDevMode = getDevMode();
  const dispatch = useDispatch();
  const handleRead = useCallback(
    (data: string) => {
      try {
        const funcRead = getFunctionScan(type);
        const qrAccount = funcRead(data);

        if (!qrAccount) {
          setError(i18n.warningMessage.invalidQRCode);
          return;
        }

        if (qrAccount.isEthereum && !isDevMode) {
          setError('Invalid QR code. EVM networks are not supported');
          return;
        }

        setError('');
        onSuccess(qrAccount);
        onHideModal();
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [isDevMode, onHideModal, onSuccess, type],
  );

  // A picked photo goes through the same checks as a camera scan; a photo with no readable
  // QR code is reported on the scanner instead of surfacing the decoder's raw error.
  const onPressLibraryBtn = async () => {
    dispatch(updatePreventLock(true));
    // The gallery sends the app to the background, which would otherwise trip the auto-lock
    // (always / biometric / elapsed timeout) and drop the unlock screen under this modal.
    // Every other system picker in the app guards the same way - see InputFile.
    AutoLockState.isPreventAutoLock = true;
    setError('');

    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.7, maxWidth: 1024, maxHeight: 1024 });

      AutoLockState.isPreventAutoLock = false;

      const asset = result.didCancel ? undefined : result.assets?.[0];

      if (!asset?.uri) {
        return;
      }

      setIsLibraryLoading(true);

      const response = await RNQRGenerator.detect({ uri: asset.uri, base64: asset.base64 });
      const value = response.values?.[0];

      // The scanner was closed while the photo was being decoded: nothing to report to.
      if (!visibleRef.current) {
        return;
      }

      if (!value) {
        setError(i18n.warningMessage.invalidQRCode);

        return;
      }

      handleRead(value);
    } catch (e) {
      console.log(e);
      visibleRef.current && setError(i18n.warningMessage.invalidQRCode);
    } finally {
      AutoLockState.isPreventAutoLock = false;
      setIsLibraryLoading(false);
      dispatch(updatePreventLock(false));
    }
  };

  // Fresh scanner on every open: no message left over from the previous attempt.
  useEffect(() => {
    visibleRef.current = visible;
    setError('');
  }, [visible]);

  return (
    // hideWhenCloseApp: the photo picker sends the app to the background, which would
    // otherwise close the scanner underneath the picker (AddressScanner opts out the same way).
    <SwFullSizeModal
      isUseModalV2
      hideWhenCloseApp={false}
      modalVisible={visible}
      modalBaseV2Ref={addressScannerRef}
      setVisible={setQrModalVisible}>
      <QrCodeScanner
        onPressCancel={onHideModal}
        onPressLibraryBtn={onPressLibraryBtn}
        onSuccess={handleRead}
        error={error}
        isLibraryLoading={isLibraryLoading}
      />
    </SwFullSizeModal>
  );
};

export default React.memo(QrAddressScanner);
