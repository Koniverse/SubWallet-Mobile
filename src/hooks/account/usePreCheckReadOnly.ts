import { RefObject, useCallback } from 'react';
import useIsReadOnlyAccount from '../useIsReadOnlyAccount';
import ToastContainer, { useToast } from 'react-native-toast-notifications';

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
            toastRef.current.show(
              message ?? 'The account you are using is read-only, you cannot use this feature with it',
            );
          } else {
            hideAll();
            show(message ?? 'The account you are using is read-only, you cannot use this feature with it');
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
