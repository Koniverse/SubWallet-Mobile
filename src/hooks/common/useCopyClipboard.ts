import Clipboard from '@react-native-clipboard/clipboard';
import { useCallback } from 'react';
import { useToast } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';

const useCopyClipboard = (text: string) => {
  const toast = useToast();

  return useCallback(() => {
    Clipboard.setString(text);
    toast.hideAll();
    toast.show(i18n.common.copiedToClipboard);
  }, [text, toast]);
};

export default useCopyClipboard;
