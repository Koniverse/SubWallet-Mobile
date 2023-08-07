import { RefObject, useCallback } from 'react';
import useIsReadOnlyAccount from '../useIsReadOnlyAccount';
import ToastContainer, { useToast } from 'react-native-toast-notifications';
import i18n from 'utils/i18n/i18n';

type VoidFunction = () => void;

const usePreCheckReadOnly = (
  toastRef?: RefObject<ToastContainer>,
  address?: string,
  message?: string,
): ((onClick: VoidFunction) => VoidFunction) => {
  const { show, hideAll } = useToast();
  const isReadOnlyAccount = useIsReadOnlyAccount(address);

  return useCallback(
    (onClick: VoidFunction) => {
      return () => {
        if (isReadOnlyAccount) {
          if (toastRef && toastRef.current) {
            toastRef.current.hideAll();
            toastRef.current.show(message ?? i18n.notificationMessage.watchOnlyNoti, {
              type: 'normal',
            });
          } else {
            hideAll();
            show(message ?? i18n.notificationMessage.watchOnlyNoti, {
              type: 'normal',
            });
          }
        } else {
          onClick();
        }
      };
    },
    [hideAll, isReadOnlyAccount, message, show, toastRef],
  );
};

export default usePreCheckReadOnly;
