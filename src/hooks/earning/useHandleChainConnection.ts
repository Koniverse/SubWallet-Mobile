import useChainChecker from 'hooks/chain/useChainChecker';
import { VoidFunction } from 'types/index';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppModalContext } from 'providers/AppModalContext';
import { Alert } from 'react-native';
import i18n from 'utils/i18n/i18n';

export const useHandleChainConnection = (
  chainSlug?: string,
  chainName?: string,
  onConnectSuccess?: VoidFunction,
  altChainData?: { chain: string; name: string },
) => {
  const { setConfirmModal, hideConfirmModal } = useContext(AppModalContext);
  const { checkChainConnected, turnOnChain } = useChainChecker(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const loadingRef = useRef(isLoading);

  const onConnectChain = useCallback(
    (currentChainSlug: string, altChain?: string) => {
      setTimeout(() => {
        setConfirmModal({
          visible: true,
          completeBtnTitle: i18n.buttonTitles.enable,
          message: i18n.common.enableChainMessage,
          title: i18n.common.enableChain,
          onCancelModal: () => {
            hideConfirmModal();
          },
          onCompleteModal: () => {
            turnOnChain(currentChainSlug);
            if (altChain) {
              turnOnChain(altChain);
            }
            setLoading(true);
            setTimeout(() => hideConfirmModal(), 0);
          },
          messageIcon: currentChainSlug,
        });
      }, 300);
    },
    [hideConfirmModal, setConfirmModal, turnOnChain],
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
            Alert.alert(
              'Connection lost',
              `${chainName} network or ${altChainData.name} network has lost connection. Re-enable the network and try again`,
              [
                {
                  text: 'I understand',
                  style: 'destructive',
                },
              ],
            );
          }
        } else {
          if (!checkChainConnected(chainSlug)) {
            Alert.alert('Error', 'Failed to get data. Please try again later', [
              {
                text: 'Continue',
                style: 'destructive',
              },
            ]);
          }
        }
      }, 3000);
    }

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [altChainData, chainName, chainSlug, checkChainConnected, onConnectSuccess]);

  return {
    checkChainConnected,
    onConnectChain,
    isLoading,
    turnOnChain,
    setLoading,
  };
};
