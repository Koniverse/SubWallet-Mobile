import Clipboard from '@react-native-clipboard/clipboard';
import React, { useCallback } from 'react';
import Toast, { useToast } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';

const useCopyClipboard = (toastRef?: React.RefObject<Toast>) => {
  const toast = useToast();

  const copyToClipboard = useCallback(
    (text: string) => {
      return () => {
        Clipboard.setString(text);
        if (toastRef && toastRef.current) {
          // @ts-ignore
          toastRef.current.hideAll();
          // @ts-ignore
          toastRef.current.show(i18n.common.copiedToClipboard);
        } else {
          toast.hideAll();
          toast.show(i18n.common.copiedToClipboard);
        }
      };
    },
    [toast, toastRef],
  );

  return { copyToClipboard };
};

export default useCopyClipboard;
