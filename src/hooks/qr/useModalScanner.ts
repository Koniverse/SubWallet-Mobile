import { useCallback, useState } from 'react';
import { QrAccount } from 'types/qr/attach';
import useCheckCamera from 'hooks/common/useCheckCamera';

interface ResultProps {
  isScanning: boolean;
  onHideModal: () => void;
  onOpenModal: () => void;
  onScan: (result: QrAccount) => void;
  setIsScanning: (value: boolean) => void;
}

const useModalScanner = (onSuccess: (result: QrAccount) => void): ResultProps => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const checkCamera = useCheckCamera();
  const onHideModal = useCallback(() => {
    setIsScanning(false);
  }, []);

  const onOpenModal = useCallback(async () => {
    checkCamera(undefined, () => setIsScanning(true))();
  }, [checkCamera]);

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
    setIsScanning: setIsScanning,
  };
};

export default useModalScanner;
