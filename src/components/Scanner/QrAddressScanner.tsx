import { SCAN_TYPE } from 'constants/qr';
import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { ScannerStyles } from 'styles/scanner';
import { STATUS_BAR_LIGHT_CONTENT } from 'styles/sharedStyles';
import { QrAccount } from 'types/qr/attach';
import i18n from 'utils/i18n/i18n';
import { BarCodeReadEvent } from 'react-native-camera';
import { getFunctionScan } from 'utils/scanner/attach';
import ModalBase from 'components/Modal/Base/ModalBase';
import { launchImageLibrary } from 'react-native-image-picker';
import RNQRGenerator from 'rn-qr-generator';
import { updatePreventLock } from 'stores/MobileSettings';
import { useDispatch } from 'react-redux';
import { useSubWalletTheme } from 'hooks/useSubWalletTheme';
import { QrCodeScanner } from 'components/QrCodeScanner';

interface Props {
  visible: boolean;
  onHideModal: () => void;
  onSuccess: (data: QrAccount) => void;
  type: SCAN_TYPE.QR_SIGNER | SCAN_TYPE.SECRET;
}

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
      <QrCodeScanner
        onPressCancel={onHideModal}
        onPressLibraryBtn={onPressLibraryBtn}
        onSuccess={handleRead}
        error={error}
      />
    </ModalBase>
  );
};

export default React.memo(QrAddressScanner);
