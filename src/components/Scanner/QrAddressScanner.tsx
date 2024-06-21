import { SCAN_TYPE } from 'constants/qr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { QrAccount } from 'types/qr/attach';
import i18n from 'utils/i18n/i18n';
import { BarCodeReadEvent } from 'react-native-camera';
import { getFunctionScan } from 'utils/scanner/attach';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { updatePreventLock } from 'stores/MobileSettings';
import { useDispatch } from 'react-redux';
import { QrCodeScanner } from 'components/QrCodeScanner';
import { SwFullSizeModal } from 'components/design-system-ui';
import { SWModalRefProps } from 'components/design-system-ui/modal/ModalBaseV2';
import { getDevMode } from 'utils/storage';

interface Props {
  visible: boolean;
  onHideModal: () => void;
  onSuccess: (data: QrAccount) => void;
  type: SCAN_TYPE.QR_SIGNER | SCAN_TYPE.SECRET;
  setQrModalVisible: (value: boolean) => void;
}

const QrAddressScanner = ({ visible, onHideModal, onSuccess, type, setQrModalVisible }: Props) => {
  const [error, setError] = useState<string>('');
  const addressScannerRef = useRef<SWModalRefProps>(null);
  const isDevMode = getDevMode();
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

        if (qrAccount.isEthereum && !isDevMode) {
          setError('Invalid QR code. EVM networks are not supported');
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
    <SwFullSizeModal
      isUseModalV2
      modalVisible={visible}
      modalBaseV2Ref={addressScannerRef}
      setVisible={setQrModalVisible}>
      <QrCodeScanner
        onPressCancel={onHideModal}
        onPressLibraryBtn={onPressLibraryBtn}
        onSuccess={handleRead}
        error={error}
      />
    </SwFullSizeModal>
  );
};

export default React.memo(QrAddressScanner);
