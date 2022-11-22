import { useCallback, useState } from 'react';
import { QrAccount } from 'types/qr/attach';

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

  const onOpenModal = useCallback(() => {
    setIsScanning(true);
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
