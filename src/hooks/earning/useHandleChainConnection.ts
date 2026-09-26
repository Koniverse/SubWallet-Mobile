import useChainChecker from 'hooks/chain/useChainChecker';
import { VoidFunction } from 'types/index';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppModalContext } from 'providers/AppModalContext';
import i18n from 'utils/i18n/i18n';
import useAlertModal from 'hooks/modal/useAlertModal';
import { NotificationType } from '@subwallet/extension-base/background/KoniTypes';

export const useHandleChainConnection = (
  chainSlug?: string,
  chainName?: string,
  onConnectSuccess?: VoidFunction,
  altChainData?: { chain: string; name: string },
) => {
  const { confirmModal } = useContext(AppModalContext);
  const { openAlert } = useAlertModal();
  const { checkChainConnected, turnOnChain } = useChainChecker(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef(isLoading);

  const onConnectChain = useCallback(
    (currentChainSlug: string, altChain?: string) => {
      setTimeout(() => {
        confirmModal.setConfirmModal({
          visible: true,
          completeBtnTitle: i18n.buttonTitles.enable,
          message: i18n.common.enableChainMessage,
          title: i18n.common.enableChain,
          onCancelModal: () => {
            confirmModal.hideConfirmModal();
          },
          onCompleteModal: () => {
            turnOnChain(currentChainSlug);
            if (altChain) {
              turnOnChain(altChain);
            }
            setLoading(true);
            setTimeout(() => confirmModal.hideConfirmModal(), 0);
          },
          messageIcon: currentChainSlug,
        });
      }, 300);
    },
    [confirmModal, turnOnChain],
  );

  useEffect(() => {
    loadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    let timeout: NodeJS.Timeout;

    if (loadingRef.current && chainSlug) {
      const checkConnection = () => {
        if (altChainData && altChainData.chain) {
          if (checkChainConnected(chainSlug) && checkChainConnected(altChainData.chain)) {
            setLoading(false);
            clearInterval(timer);
            clearTimeout(timeout);
            onConnectSuccess?.();
          }
        } else {
          if (checkChainConnected(chainSlug)) {
            setLoading(false);
            clearInterval(timer);
            clearTimeout(timeout);
            onConnectSuccess?.();
          }
        }
      };

      // Check network connection every 0.5 second
      timer = setInterval(checkConnection, 500);

      // Set timeout for 3 seconds
      timeout = setTimeout(() => {
        clearInterval(timer);
        setLoading(false);
        if (altChainData && altChainData.chain) {
          if (!checkChainConnected(chainSlug) || !checkChainConnected(altChainData.chain)) {
            openAlert({
              title: 'Connection lost',
              type: NotificationType.ERROR,
              content: `${chainName} network or ${altChainData.name} network has lost connection. Re-enable the network and try again`,
            });
          }
        } else {
          if (!checkChainConnected(chainSlug)) {
            openAlert({
              title: 'Error',
              type: NotificationType.ERROR,
              content: 'Failed to get data. Please try again later',
              okButton: { text: i18n.buttonTitles.continue },
            });
          }
        }
      }, 3000);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [altChainData, chainName, chainSlug, checkChainConnected, onConnectSuccess, openAlert]);

  return {
    checkChainConnected,
    onConnectChain,
    isLoading,
    turnOnChain,
    setLoading,
  };
};
