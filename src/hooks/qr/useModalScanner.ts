import { useCallback, useState } from 'react';
import { RESULTS } from 'react-native-permissions';
import { QrAccount } from 'types/qr/attach';
import { requestCameraPermission } from 'utils/permission/camera';

interface ResultProps {
  isScanning: boolean;
  onHideModal: () => void;
  onOpenModal: () => void;
  onScan: (result: QrAccount) => void;
}

const useModalScanner = (onSuccess: (result: QrAccount) => void): ResultProps => {
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const onHideModal = useCallback(() => {
    setIsScanning(false);
  }, []);

  const onOpenModal = useCallback(async () => {
    const result = await requestCameraPermission();

    if (result === RESULTS.GRANTED) {
      setIsScanning(true);
    }
  }, []);

  const onScan = useCallback(
    (result: QrAccount) => {
      onSuccess(result);
      setIsScanning(false);
    },
    [onSuccess],
  );

  return {
    isScanning: isScanning,
    onHideModal: onHideModal,
    onOpenModal: onOpenModal,
    onScan: onScan,
  };
};

export default useModalScanner;
